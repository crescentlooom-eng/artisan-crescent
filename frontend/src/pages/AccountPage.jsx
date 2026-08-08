import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import LoomCreditsCard from "@/components/LoomCreditsCard";

const TIMELINE_STEPS = ["Confirmed", "Packed", "Dispatched", "Out for Delivery", "Delivered"];

function getStepIndex(status) {
  if (status === "delivered") return 4;
  if (status === "out_for_delivery") return 3;
  if (status === "shipped") return 2;
  if (status === "packed") return 1;
  return 0;
}

function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return <div className="text-[11px] tracking-[0.3em] uppercase mt-4" style={{ color: "var(--cl-subtext)" }}>Order Cancelled</div>;
  }
  const activeIndex = getStepIndex(status);
  return (
    <div className="mt-5">
      {TIMELINE_STEPS.map((label, i) => {
        const isDone = i <= activeIndex;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={isDone ? { background: "#C9A96E" } : { background: "transparent", border: "1px solid var(--cl-subtext)" }} />
              {!isLast && <div className="w-px flex-1 min-h-[22px]" style={{ background: isDone && i < activeIndex ? "#C9A96E" : "var(--cl-border)" }} />}
            </div>
            <div className="pb-5 text-[13px]" style={{ color: isDone ? "var(--cl-text)" : "var(--cl-subtext)" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loom, setLoom] = useState(null);

  useEffect(() => {
    if (user) {
      api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
      api.get("/loom-credits/me").then((r) => setLoom(r.data)).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return <div className="pt-40 text-center tracking-[0.3em] uppercase text-sm" style={{ color: "var(--cl-subtext)" }}>Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div data-testid="account-page" className="page-fade pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "#C9A96E" }}>Your House</div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
          Welcome, <span className="italic" style={{ color: "#C9A96E" }}>{user.name.split(" ")[0]}</span>
        </h1>
        <button onClick={logout} data-testid="account-logout-button" className="text-[11px] tracking-[0.3em] uppercase gold-underline self-start md:self-auto" style={{ color: "var(--cl-text)", opacity: 0.8 }}>
          Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="border p-6" style={{ borderColor: "rgba(201,169,110,0.15)" }}>
          <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A96E" }}>Orders</div>
          <div style={{ color: "var(--cl-text)" }}>{orders.length} placed</div>
        </div>
        <div className="border p-6" style={{ borderColor: "rgba(201,169,110,0.15)" }}>
          <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A96E" }}>Wishlist</div>
          <Link to="/wishlist" className="gold-underline" style={{ color: "var(--cl-text)" }}>{wishlistItems.length} saved pieces</Link>
        </div>
        <div className="border p-6" style={{ borderColor: "rgba(201,169,110,0.15)" }}>
          <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A96E" }}>Loom Credits</div>
          <div style={{ color: "var(--cl-text)" }}>{loom ? `${loom.balance} card${loom.balance !== 1 ? "s" : ""}` : "—"}</div>
        </div>
      </div>

      <div className="mt-10">
        <LoomCreditsCard data={loom} />
      </div>

      {user.is_admin && (
        <div className="mt-10">
          <Link to="/admin" data-testid="account-admin-link" className="btn-gold inline-block">Open Admin</Link>
        </div>
      )}

      <h2 className="font-serif-display text-3xl md:text-4xl mt-20 mb-8" style={{ color: "var(--cl-text)" }}>Order History</h2>

      {orders.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--cl-subtext)" }}>No orders yet. The atelier is patient.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border p-6" style={{ borderColor: "rgba(201,169,110,0.15)" }} data-testid={`order-${o.id}`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>Order · {o.id.slice(0, 8)}</div>
                  <div className="mt-1" style={{ color: "var(--cl-text)" }}>{o.items.map((i) => i.name).join(" · ")}</div>
                  <div className="text-xs mt-1" style={{ color: "var(--cl-subtext)" }}>{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div style={{ color: "var(--cl-text)" }}>{formatINR(o.total)}</div>
                  {o.delhivery_awb && (
                    <div>
                      <div className="text-[11px] tracking-[0.2em] uppercase mt-2" style={{ color: "var(--cl-subtext)" }}>AWB · {o.delhivery_awb}</div>
                      <a href={`https://www.delhivery.com/track-v2/package/${o.delhivery_awb}`} target="_blank" rel="noopener noreferrer" className="text-[11px] tracking-[0.25em] uppercase gold-underline mt-1 inline-block" style={{ color: "#C9A96E" }}>Track Order ↗</a>
                    </div>
                  )}
                </div>
              </div>
              <OrderTimeline status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
