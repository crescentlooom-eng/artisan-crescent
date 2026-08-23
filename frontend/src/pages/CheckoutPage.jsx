import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const COD_TOKEN_AMOUNT = 49;

export default function CheckoutPage() {
  const { items, subtotal, clear, updateQty, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [config, setConfig] = useState({ enabled: false, key_id: "" });
  const [loom, setLoom] = useState(null);
  const [redeemCards, setRedeemCards] = useState(0);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [shipping, setShipping] = useState({
    full_name: user?.name || "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    api.get("/payments/config").then((r) => setConfig(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/loom-credits/me").then((r) => setLoom(r.data)).catch(() => setLoom(null));
      setShipping((s) => ({ ...s, full_name: s.full_name || user.name }));
    } else {
      setLoom(null);
    }
  }, [user]);

  const perCard = loom?.per_card_inr || 5;
  const minRedeem = loom?.min_redeem || 3;
  const balance = loom?.balance || 0;
  const discount = redeemCards >= minRedeem ? redeemCards * perCard : 0;
  const total = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    return (
      <div data-testid="checkout-empty" className="pt-40 text-center page-fade min-h-[60vh]">
        <div className="font-serif-display text-4xl" style={{ color: "var(--cl-text)" }}>Your bag is quiet.</div>
        <button onClick={() => navigate("/shop")} className="btn-gold mt-8">Discover the Collection</button>
      </div>
    );
  }

    const update = (k, v) => setShipping((s) => ({ ...s, [k]: v }));
  const emailValid = user ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const allFilled = ["full_name","phone","address_line","city","state","pincode"].every((k) => shipping[k].trim().length > 0) && emailValid;
    const placeOrder = async () => {
    if (!allFilled) {
      toast.error(!emailValid && !user ? "Please enter a valid email address" : "Please complete your shipping details");
      return;
    }
    setProcessing(true);
    try {
      const orderItems = items.map((it) => ({
        product_id: it.product_id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        size: it.size,
        image: it.image,
      }));
            const res = await api.post("/payments/create-order", { items: orderItems, shipping, loom_credits_redeemed: redeemCards, payment_mode: paymentMode, email: user ? undefined : email });
      const { order, razorpay_order, razorpay_key_id, demo_mode, cod_full_no_charge } = res.data;

      if (cod_full_no_charge) {
        toast.success("Order placed — pay cash on delivery");
        clear();
        navigate("/thank-you", { state: { order: { ...order, items: orderItems, total } } });
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) { toast.error("Could not load payment gateway"); setProcessing(false); return; }

      const options = {
        key: razorpay_key_id,
        amount: razorpay_order.amount,
        currency: razorpay_order.currency,
        order_id: razorpay_order.id,
        name: "Crescent Loom",
        description: "Crafted in Silence. Worn with Intention.",
        prefill: { name: shipping.full_name, contact: shipping.phone, email: user?.email || "" },
        theme: { color: "#B8C0C8" },
        handler: async (resp) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            toast.success("Payment received — your pieces are on their way");
            clear();
            navigate("/thank-you", { state: { order: { ...order, items: orderItems, total } } });
          } catch (e) {
            toast.error("Payment verification failed");
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      toast.error("Could not create order");
      console.error(e);
      setProcessing(false);
    }
  };

  return (
    <div data-testid="checkout-page" className="page-fade pt-32 pb-24 max-w-none mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--cl-text)" }}>Checkout</div>
      <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
        Your <span className="italic" style={{ color: "var(--cl-text)" }}>Bag</span>
      </h1>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12">
        <div className="lg:col-span-7 space-y-12">
          <section>
            <h2 className="font-serif-display text-2xl md:text-3xl mb-6" style={{ color: "var(--cl-text)" }}>Shipping</h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {!user && (
                <div className="sm:col-span-2">
                  <label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Email</label>
                  <input type="email" data-testid="checkout-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  <p className="text-xs mt-1" style={{ color: "var(--cl-subtext)" }}>We'll send your order confirmation and tracking link here.</p>
                </div>
              )}
              <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Full Name</label><input data-testid="checkout-name" value={shipping.full_name} onChange={(e) => update("full_name", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Phone</label><input data-testid="checkout-phone" value={shipping.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Pincode</label><input data-testid="checkout-pincode" value={shipping.pincode} onChange={(e) => update("pincode", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Address</label><input data-testid="checkout-address" value={shipping.address_line} onChange={(e) => update("address_line", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>City</label><input data-testid="checkout-city" value={shipping.city} onChange={(e) => update("city", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>State</label><input data-testid="checkout-state" value={shipping.state} onChange={(e) => update("state", e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl md:text-3xl mb-6" style={{ color: "var(--cl-text)" }}>Loom Credits</h2>
            {!user ? (
              <div className="border p-6 text-sm" style={{ borderColor: "rgba(184,192,200,0.2)", color: "var(--cl-text)", opacity: 0.85 }}>
                <a href="/login" className="gold-underline" style={{ color: "#B8C0C8" }}>Sign in</a> to redeem Loom Credit Cards collected from past orders.
              </div>
            ) : balance === 0 ? (
              <div className="border p-6 text-sm" style={{ borderColor: "rgba(184,192,200,0.2)", color: "var(--cl-text)", opacity: 0.85 }}>
                You have no Loom Credit Cards yet. Each order ships with one — collect {minRedeem} to redeem ₹{minRedeem * perCard} off.
              </div>
            ) : (
              <div className="border p-6" style={{ borderColor: "rgba(184,192,200,0.2)" }} data-testid="checkout-loom-section">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#B8C0C8" }}>Your Balance</div>
                    <div className="font-serif-display text-3xl mt-1" style={{ color: "var(--cl-text)" }}>{balance} {balance === 1 ? "card" : "cards"} <span className="text-lg" style={{ color: "var(--cl-subtext)" }}>· ₹{balance * perCard}</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRedeemCards(balance)}
                    className="text-[11px] tracking-[0.3em] uppercase gold-underline"
                    style={{ color: "var(--cl-text)", opacity: 0.85 }}
                    data-testid="checkout-loom-redeem-max"
                  >Redeem All</button>
                </div>
                <label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Cards to redeem</label>
                <input
                  type="number"
                  min="0"
                  max={balance}
                  value={redeemCards}
                  onChange={(e) => setRedeemCards(Math.max(0, Math.min(balance, parseInt(e.target.value || "0", 10))))}
                  data-testid="checkout-loom-cards-input"
                />
                {redeemCards > 0 && redeemCards < minRedeem && (
                  <p className="text-xs mt-3" style={{ color: "var(--cl-subtext)" }} data-testid="checkout-loom-min-warning">
                    Minimum {minRedeem} cards required — you&rsquo;ll need {minRedeem - redeemCards} more before this discount applies.
                  </p>
                )}
                {redeemCards >= minRedeem && (
                  <p className="text-xs mt-3 tracking-[0.2em] uppercase" style={{ color: "#B8C0C8" }} data-testid="checkout-loom-discount-msg">
                    ₹{redeemCards * perCard} discount will be applied.
                  </p>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif-display text-2xl md:text-3xl mb-6" style={{ color: "var(--cl-text)" }}>Payment</h2>
            <div className="space-y-3">
              {[
                { key: "prepaid", label: "Prepaid", badge: "⚡ Priority packing — ships faster", desc: `Pay ${formatINR(total)} now via UPI, card, or netbanking.` },
                { key: "cod_partial", label: "Partial COD", badge: "⚡ Priority packing — ships faster", desc: `Pay ${formatINR(Math.min(COD_TOKEN_AMOUNT, total))} now, ${formatINR(Math.max(0, total - COD_TOKEN_AMOUNT))} cash on delivery.` },
                { key: "cod_full", label: "Cash on Delivery", badge: null, desc: `Pay ${formatINR(total)} in cash when your order arrives.` },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPaymentMode(opt.key)}
                  data-testid={`payment-mode-${opt.key.replace("_", "-")}`}
                  className="w-full text-left border p-5 transition"
                  style={{ borderColor: paymentMode === opt.key ? "#B8C0C8" : "rgba(184,192,200,0.2)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-text)" }}>{opt.label}</div>
                    {opt.badge && <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#B8C0C8" }}>{opt.badge}</span>}
                  </div>
                  <p className="text-sm mt-2" style={{ color: "var(--cl-subtext)" }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="border p-6 lg:sticky lg:top-32" style={{ borderColor: "rgba(184,192,200,0.2)", background: "var(--cl-surface)" }}>
            <h3 className="font-serif-display text-2xl mb-6" style={{ color: "var(--cl-text)" }}>Order Summary</h3>
            <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.key} className="flex gap-3">
                  <div className="w-16 h-20 flex-shrink-0 overflow-hidden" style={{ background: "var(--cl-bg)" }}>
                    {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 text-sm min-w-0">
                    <div className="font-serif-display text-lg leading-tight truncate" style={{ color: "var(--cl-text)" }}>{it.name}</div>
                    <div className="text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: "var(--cl-subtext)" }}>
                      {it.size && <>Size · {it.size}</>}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border" style={{ borderColor: "var(--cl-border)" }}>
                        <button onClick={() => updateQty(it.key, Math.max(1, it.quantity - 1))} className="px-2 py-1" style={{ color: "var(--cl-text)" }}><Minus size={11} /></button>
                        <span className="px-2 text-xs" style={{ color: "var(--cl-text)" }}>{it.quantity}</span>
                        <button onClick={() => updateQty(it.key, it.quantity + 1)} className="px-2 py-1" style={{ color: "var(--cl-text)" }}><Plus size={11} /></button>
                      </div>
                      <button onClick={() => removeItem(it.key)} aria-label="Remove" style={{ color: "var(--cl-subtext)" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="text-sm shrink-0" style={{ color: "var(--cl-text)" }}>{formatINR(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="divider-thin my-6" />
            <div className="flex items-center justify-between text-sm" style={{ color: "var(--cl-text)", opacity: 0.85 }}><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm mt-2" style={{ color: "var(--cl-text)", opacity: 0.85 }}><span>Shipping</span><span>Complimentary</span></div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm mt-2" style={{ color: "#B8C0C8" }} data-testid="checkout-loom-discount-row">
                <span>Loom Credits ({redeemCards} × ₹{perCard})</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
            <div className="divider-thin my-6" />
            <div className="flex items-center justify-between"><span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#B8C0C8" }}>Total</span><span className="text-2xl" style={{ color: "var(--cl-text)" }} data-testid="checkout-total">{formatINR(total)}</span></div>
            <button data-testid="checkout-place-order" onClick={placeOrder} disabled={processing} className="btn-gold w-full mt-8 disabled:opacity-50">
              {processing
                ? "Processing..."
                : paymentMode === "cod_full"
                ? "Place Order — Pay on Delivery"
                : paymentMode === "cod_partial"
                ? `Pay ${formatINR(Math.min(COD_TOKEN_AMOUNT, total))} & Place Order`
                : "Place Order"}
            </button>
            <div className="flex items-center justify-center gap-2 mt-5">
              <ShieldCheck size={13} style={{ color: "var(--cl-subtext)" }} />
              <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--cl-subtext)" }}>Secure Checkout via Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
