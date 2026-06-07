"""Telegram + Email notification dispatcher for Crescent Loom admin alerts."""
import os
import logging
import httpx
import asyncio
from typing import Optional
from email.message import EmailMessage

logger = logging.getLogger(__name__)

TG_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TG_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "Crescent Loom")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")


def _format_inr(n) -> str:
    try:
        return f"₹{int(round(float(n))):,}"
    except Exception:
        return f"₹{n}"


def _order_summary_lines(order: dict, prefix_emoji: str, title: str) -> str:
    items = order.get("items", [])
    first = items[0] if items else {}
    qty_total = sum(i.get("quantity", 0) for i in items)
    product_line = ", ".join(f"{i.get('name','')}" for i in items[:3])
    if len(items) > 3:
        product_line += f" +{len(items)-3} more"
    sizes = ", ".join(filter(None, [i.get("size") for i in items])) or "—"
    shipping = order.get("shipping", {})
    addr = " · ".join(filter(None, [
        shipping.get("address_line"),
        shipping.get("city"),
        shipping.get("state"),
        shipping.get("pincode"),
    ]))
    payment_status = order.get("status", "pending")
    payment_emoji = "✅" if payment_status in ("paid", "shipped", "delivered", "out_for_delivery", "packed") else "⏳" if payment_status == "pending" else "❌"
    discount = order.get("loom_credits_discount", 0) or 0
    lines = [
        f"{prefix_emoji} {title} — Crescent Loom",
        f"Customer: {shipping.get('full_name') or order.get('email','—')}",
        f"Order ID: #{order.get('id','')[:8]}",
        f"Product: {product_line or '—'}",
        f"Size: {sizes} | Color: {first.get('variant_name','—') if first else '—'}",
        f"Quantity: {qty_total}",
        f"Amount: {_format_inr(order.get('total', 0))}",
    ]
    if discount and discount > 0:
        lines.append(f"Loom Credits: −{_format_inr(discount)} ({order.get('loom_credits_redeemed',0)} cards)")
    lines += [
        f"Address: {addr or '—'}",
        f"Payment: {payment_emoji} {payment_status.replace('_',' ').title()}",
    ]
    if shipping.get("phone"):
        lines.append(f"Phone: {shipping['phone']}")
    return "\n".join(lines)


async def send_telegram(text: str) -> bool:
    if not (TG_TOKEN and TG_CHAT_ID):
        logger.info("[TG SKIPPED — no creds] %s", text[:80])
        return False
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10.0) as hc:
            r = await hc.post(url, json={"chat_id": TG_CHAT_ID, "text": text, "disable_web_page_preview": True})
        if r.status_code != 200:
            logger.error("Telegram send failed: %s %s", r.status_code, r.text[:200])
            return False
        return True
    except Exception as e:
        logger.error("Telegram exception: %s", e)
        return False


async def send_email(to: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
    if not (SMTP_USER and SMTP_PASSWORD and to):
        logger.info("[EMAIL SKIPPED — no creds or recipient] to=%s subject=%s", to, subject)
        return False
    try:
        import aiosmtplib
        msg = EmailMessage()
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body_text)
        if body_html:
            msg.add_alternative(body_html, subtype="html")
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            timeout=20,
        )
        return True
    except Exception as e:
        logger.error("Email send failed: %s", e)
        return False


# ============ Public event helpers ============
async def notify_new_order(order: dict):
    text = _order_summary_lines(order, "🛍️", "New Order")
    await send_telegram(text)
    if ADMIN_EMAIL:
        html = "<pre style='font-family:monospace;line-height:1.6'>" + text + "</pre>"
        await send_email(ADMIN_EMAIL, f"New Order #{order.get('id','')[:8]} — Crescent Loom", text, html)


async def notify_payment(order: dict, success: bool):
    title = "Payment Successful" if success else "Payment Failed"
    emoji = "✅" if success else "❌"
    text = _order_summary_lines(order, emoji, title)
    await send_telegram(text)


async def notify_loom_redeem(order: dict):
    text = _order_summary_lines(order, "🎁", "Loom Credits Redeemed")
    await send_telegram(text)


async def notify_status_update(order: dict, new_status: str):
    text = _order_summary_lines(order, "📦", f"Status → {new_status.replace('_',' ').title()}")
    await send_telegram(text)
    # Customer email
    cust_email = order.get("email")
    if cust_email and "@" in cust_email and cust_email != "guest@crescentloom.com":
        nice_status = new_status.replace("_", " ").title()
        subject = f"Your Crescent Loom order is now {nice_status}"
        cust_name = (order.get("shipping") or {}).get("full_name", "")
        items = ", ".join(i.get("name", "") for i in order.get("items", []))
        body_text = (
            f"Dear {cust_name or 'Friend'},\n\n"
            f"Your order #{order.get('id','')[:8]} ({items}) is now {nice_status}.\n\n"
            f"Crafted in Silence. Worn with Intention.\n— Crescent Loom"
        )
        body_html = f"""
        <div style="font-family:Georgia,serif;background:#0B0E1A;color:#F5F0E8;padding:48px;max-width:560px;margin:auto">
          <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A96E;margin-bottom:24px">Crescent Loom</div>
          <h1 style="font-family:Georgia,serif;font-weight:300;font-size:36px;line-height:1.1;color:#F5F0E8;margin:0 0 16px">Your order is now <em style="color:#C9A96E">{nice_status}</em></h1>
          <p style="font-size:14px;line-height:1.7;color:#F5F0E8;opacity:0.85">Dear {cust_name or 'Friend'},</p>
          <p style="font-size:14px;line-height:1.7;color:#F5F0E8;opacity:0.85">Your order <strong>#{order.get('id','')[:8]}</strong> — {items} — has been updated to <strong style="color:#C9A96E">{nice_status}</strong>.</p>
          <div style="border-top:1px solid rgba(201,169,110,0.25);margin-top:32px;padding-top:24px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#8A8FA8">Crafted in Silence. Worn with Intention.</div>
        </div>
        """
        await send_email(cust_email, subject, body_text, body_html)


def fire_and_forget(coro):
    """Schedule a coroutine without blocking the request."""
    try:
        asyncio.create_task(coro)
    except RuntimeError:
        # Fallback if no running loop
        asyncio.get_event_loop().create_task(coro)
