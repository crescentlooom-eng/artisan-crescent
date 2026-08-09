import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/api";

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate("/", { replace: true });
      return;
    }
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: order.total,
        currency: "INR",
        content_ids: (order.items || []).map((i) => i.product_id),
        content_type: "product",
        num_items: (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0),
      });
    }
    // eslint-disable-next-line
  }, [order]);

  if (!order) return null;

  return (
    <div data-testid="thank-you-page" className="page-fade pt-32 pb-24 max-w-3xl mx-auto px-6 md:px-12 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ border: "1px solid rgba(201,169,110,0.4)" }}>
        <CheckCircle2 size={28} style={{ color: "#C9A96E" }} />
      </div>

      <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "#C9A96E" }}>Order Confirmed</div>
      <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
        Crafted in Silence. <span className="italic" style={{ color: "#C9A96E" }}>On Its Way.</span>
      </h1>
      <p className="mt-6 max-w-xl mx-auto" style={{ color: "var(--cl-subtext)" }}>
        Thank you for choosing Crescent Loom. Your order has been placed and our atelier is preparing it for shipment.
        You'll receive updates by email as it moves.
      </p>

      <div className="border p-8 mt-10 text-left" style={{ borderColor: "rgba(201,169,110,0.2)", background: "var(--cl-surface)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Order ID</div>
            <div className="mt-1" style={{ color: "var(--cl-text)" }}>#{order.id?.slice(0, 8)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Total Paid</div>
            <div className="mt-1 text-xl" style={{ color: "var(--cl-text)" }}>{formatINR(order.total)}</div>
          </div>
        </div>

        <div className="divider-thin my-6" />

        <div className="space-y-4">
          {(order.items || []).map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div>
                <div style={{ color: "var(--cl-text)" }}>{it.name}</div>
                <div className="text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: "var(--cl-subtext)" }}>
                  {it.size && <>Size · {it.size} · </>}Qty {it.quantity}
                </div>
              </div>
              <div style={{ color: "var(--cl-text)" }}>{formatINR(it.price * it.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <Link to="/account" className="btn-gold inline-block" data-testid="thank-you-view-orders">
          View Your Orders
        </Link>
        <Link to="/shop" className="text-[11px] tracking-[0.3em] uppercase gold-underline self-center" style={{ color: "var(--cl-text)", opacity: 0.8 }} data-testid="thank-you-continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
