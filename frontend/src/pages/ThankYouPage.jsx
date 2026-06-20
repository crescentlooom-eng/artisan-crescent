import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { formatINR } from "@/lib/api";

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    // If someone lands here directly without an order (e.g. refresh, bookmark), send them home
    if (!order) {
      navigate("/", { replace: true });
      return;
    }

    // Fire Meta Pixel Purchase event client-side
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
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Order Confirmed</div>
      <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">
        Crafted in Silence. <span className="italic text-[#C9A96E]/90">On Its Way.</span>
      </h1>
      <p className="text-[#F5F0E8]/75 mt-6 max-w-xl mx-auto">
        Thank you for choosing Crescent Loom. Your order has been placed and our atelier is preparing it for shipment.
        You'll receive updates by email as it moves.
      </p>

      <div className="border border-[#C9A96E]/20 p-8 mt-10 text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Order ID</div>
            <div className="text-[#F5F0E8] mt-1">#{order.id?.slice(0, 8)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Total Paid</div>
            <div className="text-[#F5F0E8] mt-1 text-xl">{formatINR(order.total)}</div>
          </div>
        </div>

        <div className="divider-thin my-6" />

        <div className="space-y-4">
          {(order.items || []).map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div>
                <div className="text-[#F5F0E8]">{it.name}</div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">
                  {it.size && <>Size · {it.size} · </>}Qty {it.quantity}
                </div>
              </div>
              <div className="text-[#F5F0E8]">{formatINR(it.price * it.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <Link to="/account" className="btn-gold inline-block" data-testid="thank-you-view-orders">
          View Your Orders
        </Link>
        <Link to="/shop" className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80 self-center" data-testid="thank-you-continue-shopping">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
