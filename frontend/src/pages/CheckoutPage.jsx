import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [config, setConfig] = useState({ enabled: false, key_id: "" });
  const [loom, setLoom] = useState(null);
  const [redeemCards, setRedeemCards] = useState(0);
  const [paymentMode, setPaymentMode] = useState("prepaid"); // prepaid | cod_partial | cod_full
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
        <div className="font-serif-display text-4xl text-[#F5F0E8]">Your bag is quiet.</div>
        <button onClick={() => navigate("/shop")} className="btn-gold mt-8">Discover the Collection</button>
      </div>
    );
  }

  const update = (k, v) => setShipping((s) => ({ ...s, [k]: v }));
  const allFilled = ["full_name","phone","address_line","city","state","pincode"].every((k) => shipping[k].trim().length > 0);

  const placeOrder = async () => {
    if (!allFilled) {
      toast.error("Please complete your shipping details");
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
      const res = await api.post("/payments/create-order", { items: orderItems, shipping, loom_credits_redeemed: redeemCards, payment_mode: paymentMode });
      const { order, razorpay_order, razorpay_key_id, demo_mode, cod_full_no_charge } = res.data;

      if (cod_full_no_charge) {
        toast.success("Order placed — pay cash on delivery");
        clear();
        navigate("/thank-you", { state: { order: { ...order, items: orderItems, total } } });
        return;
      }

     if (demo_mode) {
        // Demo mode — simulate success
        await api.post(`/payments/demo-complete/${order.id}`);
        toast.success("Order placed (demo mode — no Razorpay keys configured)");
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
        theme: { color: "#C9A96E" },
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
    <div data-testid="checkout-page" className="page-fade pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Checkout</div>
      <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">A Quiet <span className="italic text-[#C9A96E]/90">Finish</span></h1>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12">
        <div className="lg:col-span-7 space-y-12">
          <section>
            <h2 className="font-serif-display text-2xl md:text-3xl text-[#F5F0E8] mb-6">Shipping</h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Full Name</label><input data-testid="checkout-name" value={shipping.full_name} onChange={(e) => update("full_name", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Phone</label><input data-testid="checkout-phone" value={shipping.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Pincode</label><input data-testid="checkout-pincode" value={shipping.pincode} onChange={(e) => update("pincode", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Address</label><input data-testid="checkout-address" value={shipping.address_line} onChange={(e) => update("address_line", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">City</label><input data-testid="checkout-city" value={shipping.city} onChange={(e) => update("city", e.target.value)} /></div>
              <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">State</label><input data-testid="checkout-state" value={shipping.state} onChange={(e) => update("state", e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h2 className="font-serif-display text-2xl md:text-3xl text-[#F5F0E8] mb-6">Loom Credits</h2>
            {!user ? (
              <div className="border border-[#C9A96E]/20 p-6 text-sm text-[#F5F0E8]/75">
                <a href="/login" className="text-[#C9A96E] gold-underline">Sign in</a> to redeem Loom Credit Cards collected from past orders.
              </div>
            ) : balance === 0 ? (
              <div className="border border-[#C9A96E]/20 p-6 text-sm text-[#F5F0E8]/75">
                You have no Loom Credit Cards yet. Each order ships with one — collect {minRedeem} to redeem ₹{minRedeem * perCard} off.
              </div>
            ) : (
              <div className="border border-[#C9A96E]/20 p-6" data-testid="checkout-loom-section">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Your Balance</div>
                    <div className="font-serif-display text-3xl text-[#F5F0E8] mt-1">{balance} {balance === 1 ? "card" : "cards"} <span className="text-[#8A8FA8] text-lg">· ₹{balance * perCard}</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRedeemCards(balance)}
                    className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80"
                    data-testid="checkout-loom-redeem-max"
                  >Redeem All</button>
                </div>
                <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Cards to redeem</label>
                <input
                  type="number"
                  min="0"
                  max={balance}
                  value={redeemCards}
                  onChange={(e) => setRedeemCards(Math.max(0, Math.min(balance, parseInt(e.target.value || "0", 10))))}
                  data-testid="checkout-loom-cards-input"
                />
                {redeemCards > 0 && redeemCards < minRedeem && (
                  <p className="text-[#8A8FA8] text-xs mt-3" data-testid="checkout-loom-min-warning">
                    Minimum {minRedeem} cards required — you&rsquo;ll need {minRedeem - redeemCards} more before this discount applies.
                  </p>
                )}
                {redeemCards >= minRedeem && (
                  <p className="text-[#C9A96E] text-xs mt-3 tracking-[0.2em] uppercase" data-testid="checkout-loom-discount-msg">
                    ₹{redeemCards * perCard} discount will be applied.
                  </p>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif-display text-2xl md:text-3xl text-[#F5F0E8] mb-6">Payment</h2>
            <div className="space-y-3">

              <button
                type="button"
                onClick={() => setPaymentMode("prepaid")}
                data-testid="payment-mode-prepaid"
                className={`w-full text-left border p-5 transition ${paymentMode === "prepaid" ? "border-[#C9A96E]" : "border-[#C9A96E]/20"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]">Prepaid</div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E]">⚡ Priority packing — ships faster</span>
                </div>
                <p className="text-[#F5F0E8]/60 text-sm mt-2">Pay {formatINR(total)} now via UPI, card, or netbanking.</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("cod_partial")}
                data-testid="payment-mode-cod-partial"
                className={`w-full text-left border p-5 transition ${paymentMode === "cod_partial" ? "border-[#C9A96E]" : "border-[#C9A96E]/20"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]">Partial COD</div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E]">⚡ Priority packing — ships faster</span>
                </div>
                <p className="text-[#F5F0E8]/60 text-sm mt-2">
                  Pay {formatINR(Math.min(COD_TOKEN_AMOUNT, total))} now, {formatINR(Math.max(0, total - COD_TOKEN_AMOUNT))} cash on delivery.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("cod_full")}
                data-testid="payment-mode-cod-full"
                className={`w-full text-left border p-5 transition ${paymentMode === "cod_full" ? "border-[#C9A96E]" : "border-[#C9A96E]/20"}`}
              >
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]">Cash on Delivery</div>
                <p className="text-[#F5F0E8]/60 text-sm mt-2">Pay {formatINR(total)} in cash when your order arrives.</p>
              </button>

            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="border border-[#C9A96E]/20 p-6 lg:sticky lg:top-32">
            <h3 className="font-serif-display text-2xl text-[#F5F0E8] mb-6">Your Bag</h3>
            <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.key} className="flex gap-3">
                  <div className="w-16 h-20 bg-[#14172A] flex-shrink-0 overflow-hidden">
                    {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-serif-display text-lg text-[#F5F0E8] leading-tight">{it.name}</div>
                    <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">
                      {it.size && <>Size · {it.size} · </>}Qty {it.quantity}
                    </div>
                  </div>
                  <div className="text-sm text-[#F5F0E8]">{formatINR(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="divider-thin my-6" />
            <div className="flex items-center justify-between text-sm text-[#F5F0E8]/85"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm text-[#F5F0E8]/85 mt-2"><span>Shipping</span><span>Complimentary</span></div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm text-[#C9A96E] mt-2" data-testid="checkout-loom-discount-row">
                <span>Loom Credits ({redeemCards} × ₹{perCard})</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
            <div className="divider-thin my-6" />
            <div className="flex items-center justify-between"><span className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Total</span><span className="text-2xl text-[#F5F0E8]" data-testid="checkout-total">{formatINR(total)}</span></div>
            <button data-testid="checkout-place-order" onClick={placeOrder} disabled={processing} className="btn-gold w-full mt-8 disabled:opacity-50">
              {processing
                ? "Processing..."
                : paymentMode === "cod_full"
                ? "Place Order — Pay on Delivery"
                : paymentMode === "cod_partial"
                ? `Pay ${formatINR(Math.min(COD_TOKEN_AMOUNT, total))} & Place Order`
                : "Place Order"}
            </button>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-4 text-center">Secure payments via Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
