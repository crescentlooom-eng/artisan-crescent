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
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "Crescent Loom")
SMTP_USER = os.environ.get("SMTP_USER", "")  # used as FROM email
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


def _customer_confirmation_html(order: dict) -> str:
    shipping = order.get("shipping", {})
    cust_name = shipping.get("full_name", "Friend")
    order_id = order.get("id", "")[:8].upper()
    items = order.get("items", [])
    discount = order.get("loom_credits_discount", 0) or 0
    addr = ", ".join(filter(None, [
        shipping.get("address_line"),
        shipping.get("city"),
        shipping.get("state"),
        shipping.get("pincode"),
    ]))

    items_rows = ""
    for item in items:
        size_info = f" · {item.get('size')}" if item.get("size") else ""
        items_rows += f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid rgba(201,169,110,0.1);color:#F5F0E8;font-size:14px">
            {item.get('name','')}
            <span style="color:#8A8FA8;font-size:12px">{size_info}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid rgba(201,169,110,0.1);color:#8A8FA8;font-size:13px;text-align:center">x{item.get('quantity',1)}</td>
          <td style="padding:12px 0;border-bottom:1px solid rgba(201,169,110,0.1);color:#F5F0E8;font-size:14px;text-align:right">{_format_inr(item.get('price',0) * item.get('quantity',1))}</td>
        </tr>
        """

    discount_row = ""
    if discount > 0:
        discount_row = f"""
        <tr>
          <td colspan="2" style="padding:8px 0;color:#C9A96E;font-size:13px">Loom Credits ({order.get('loom_credits_redeemed',0)} cards)</td>
          <td style="padding:8px 0;color:#C9A96E;font-size:13px;text-align:right">-{_format_inr(discount)}</td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0E1A;font-family:Georgia,serif">
  <div style="max-width:580px;margin:0 auto;background:#0B0E1A;padding:48px 32px">
    <div style="border-bottom:1px solid rgba(201,169,110,0.2);padding-bottom:24px;margin-bottom:32px">
      <div style="font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:#C9A96E">Crescent Loom</div>
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#8A8FA8;margin-top:4px">Crafted in Silence. Worn with Intention.</div>
    </div>
    <h1 style="font-family:Georgia,serif;font-weight:300;font-size:38px;line-height:1.1;color:#F5F0E8;margin:0 0 8px">Order <em style="color:#C9A96E">Confirmed</em></h1>
    <p style="font-size:14px;color:#8A8FA8;margin:0 0 32px;letter-spacing:0.05em">#{order_id}</p>
    <p style="font-size:15px;line-height:1.7;color:#F5F0E8;opacity:0.85;margin:0 0 8px">Dear {cust_name},</p>
    <p style="font-size:14px;line-height:1.7;color:#F5F0E8;opacity:0.7;margin:0 0 32px">Thank you for your order. We have received your payment and your pieces are being prepared with care. You will receive another update once your order is dispatched.</p>
    <div style="background:rgba(201,169,110,0.05);border:1px solid rgba(201,169,110,0.15);padding:24px;margin-bottom:24px">
      <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A96E;margin-bottom:16px">Your Order</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8A8FA8;padding-bottom:8px;border-bottom:1px solid rgba(201,169,110,0.2);font-weight:400">Item</th>
            <th style="text-align:center;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8A8FA8;padding-bottom:8px;border-bottom:1px solid rgba(201,169,110,0.2);font-weight:400">Qty</th>
            <th style="text-align:right;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8A8FA8;padding-bottom:8px;border-bottom:1px solid rgba(201,169,110,0.2);font-weight:400">Price</th>
          </tr>
        </thead>
        <tbody>{items_rows}{discount_row}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A96E">Total</td>
            <td style="padding:16px 0 0;font-size:20px;color:#F5F0E8;text-align:right">{_format_inr(order.get('total',0))}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:4px 0 0;font-size:12px;color:#8A8FA8;text-align:right">Free Shipping · Delhi NCR</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style="background:rgba(201,169,110,0.05);border:1px solid rgba(201,169,110,0.15);padding:24px;margin-bottom:32px">
      <div style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A96E;margin-bottom:12px">Delivering To</div>
      <div style="font-size:14px;color:#F5F0E8;line-height:1.7">
        <strong>{shipping.get('full_name','')}</strong><br/>
        {addr}<br/>
        <span style="color:#8A8FA8">{shipping.get('phone','')}</span>
      </div>
    </div>
    <div style="border-left:2px solid rgba(201,169,110,0.4);padding-left:16px;margin-bottom:32px">
      <p style="font-size:13px;color:#F5F0E8;opacity:0.7;margin:0;line-height:1.7">We ship via <strong style="color:#F5F0E8">Delhivery</strong>. Your tracking details will be shared once the order is dispatched — typically within 1-2 business days.</p>
    </div>
    <p style="font-size:13px;color:#8A8FA8;line-height:1.7;margin:0 0 32px">Questions? WhatsApp us at <a href="https://wa.me/919810924300" style="color:#C9A96E;text-decoration:none">+91 98109 24300</a> or email <a href="mailto:crescent.looom@gmail.com" style="color:#C9A96E;text-decoration:none">crescent.looom@gmail.com</a></p>
    <div style="border-top:1px solid rgba(201,169,110,0.15);padding-top:24px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#8A8FA8">Crescent Loom · Delhi NCR · crescentloom.store</div>
  </div>
</body>
</html>"""


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
    if not (SENDGRID_API_KEY and to):
        logger.info("[EMAIL SKIPPED — no SendGrid key or recipient] to=%s subject=%s", to, subject)
        return False
    from_email = SMTP_USER or "crescent.looom@gmail.com"
    payload = {
        "personalizations": [{"to": [{"email": to}]}],
        "from": {"email": from_email, "name": SMTP_FROM_NAME},
        "subject": subject,
        "content": [{"type": "text/plain", "value": body_text}],
    }
    if body_html:
        payload["content"].append({"type": "text/html", "value": body_html})
    try:
        async with httpx.AsyncClient(timeout=20.0) as hc:
            r = await hc.post(
                "https://api.sendgrid.com/v3/mail/send",
                json=payload,
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
        if r.status_code not in (200, 202):
            logger.error("SendGrid send failed: %s %s", r.status_code, r.text[:200])
            return False
        logger.info("Email sent via SendGrid to %s", to)
        return True
    except Exception as e:
        logger.error("SendGrid exception: %s", e)
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

    # Customer order confirmation email on successful payment
    if success:
        cust_email = order.get("email")
        if cust_email and "@" in cust_email and cust_email != "guest@crescentloom.com":
            cust_name = (order.get("shipping") or {}).get("full_name", "Friend")
            order_id = order.get("id", "")[:8].upper()
            items_text = "\n".join(
                f"  - {i.get('name','')} (Size: {i.get('size','—')}) x{i.get('quantity',1)} — {_format_inr(i.get('price',0) * i.get('quantity',1))}"
                for i in order.get("items", [])
            )
            shipping = order.get("shipping", {})
            body_text = (
                f"Dear {cust_name},\n\n"
                f"Your order #{order_id} has been confirmed!\n\n"
                f"ORDER DETAILS:\n{items_text}\n\n"
                f"Total: {_format_inr(order.get('total', 0))}\n"
                f"Shipping: Free · Delhi NCR\n\n"
                f"Delivering to: {shipping.get('address_line','')}, {shipping.get('city','')}, {shipping.get('pincode','')}\n\n"
                f"We'll send you tracking details once your order is dispatched.\n\n"
                f"Crafted in Silence. Worn with Intention.\n— Crescent Loom\n"
                f"crescentloom.store"
            )
            html = _customer_confirmation_html(order)
            await send_email(
                cust_email,
                f"Order Confirmed #{order_id} — Crescent Loom",
                body_text,
                html,
            )


async def notify_loom_redeem(order: dict):
    text = _order_summary_lines(order, "🎁", "Loom Credits Redeemed")
    await send_telegram(text)


async def notify_status_update(order: dict, new_status: str):
    text = _order_summary_lines(order, "📦", f"Status → {new_status.replace('_',' ').title()}")
    await send_telegram(text)
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
          <p style="font-size:14px;line-height:1.7;color:#F5F0E8;opacity:0.85">Your order <strong>#{order.get('id','')[:8]}</strong> - {items} - has been updated to <strong style="color:#C9A96E">{nice_status}</strong>.</p>
          <div style="border-top:1px solid rgba(201,169,110,0.25);margin-top:32px;padding-top:24px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#8A8FA8">Crafted in Silence. Worn with Intention.</div>
        </div>
        """
        await send_email(cust_email, subject, body_text, body_html)


def fire_and_forget(coro):
    """Schedule a coroutine without blocking the request."""
    try:
        asyncio.create_task(coro)
    except RuntimeError:
        asyncio.get_event_loop().create_task(coro)
