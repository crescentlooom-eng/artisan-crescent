import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoomCreditsCard from "@/components/LoomCreditsCard";

const TIMELINE_STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "dispatched", label: "Dispatched" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function getStepIndex(status) {
  if (status === "cancelled") return -1;
  if (status === "delivered") return 4;
  if (status === "out_for_delivery") return 3;
  if (status === "shipped") return 2;
  if (status === "packed") return 1;
  if (["placed", "paid", "pending"].includes(status)) return 0;
  return 0;
}

function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] mt-4">Order Cancelled</div>
    );
  }
  const activeIndex = getStepIndex(status);
  return (
    <div className="mt-5">
      {TIMELINE_STEPS.map((step, i) => {
        const isDone = i <= activeIndex;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  isDone ? "bg-[#C9A96E]" : "bg-transparent border border-[#8A8FA8]/50"
                }`}
              />
              {!isLast && (
                <div
                  className={`w-px flex-1 min-h-[22px] ${
                    isDone && i < activeIndex ? "bg-[#C9A96E]" : "bg-[#8A8FA8]/30"
                  }`}
                />
              )}
            </div>
            <div className={`pb-5 text-[13px] ${isDone ? "text-[#F5F0E8]" : "text-[#8A8FA8]"}`}>
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loom, setLoom] = useState(null);

  useEffect(() => {
    if (user) {
      api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
      api.get("/loom-credits/me").then((r) => setLoom(r.data)).catch(() => {});
    }
  }, [user]);

  if (loading) return <div className="pt-40 text-center text-[#8A8FA8] tracking-[0.3em] uppercase text-sm">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div data-testid="account-page" className="page-fade pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Your House</div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">
          Welcome, <span className="italic text-[#C9A96E]/90">{user.name.split(" ")[0]}</span>
        </h1>
        <button
          onClick={logout}
          data-testid="account-logout-button"
          className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80 self-start md:self-auto"
        >
          Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="border border-[#C9A96E]/15 p-6">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Email</div>
          <div className="text-[#F5F0E8]">{user.email}</div>
        </div>
        <div className="border border-[#C9A96E]/15 p-6">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Wishlist</div>
          <Link to="/wishlist" className="text-[#F5F0E8] gold-underline">Saved pieces</Link>
        </div>
        <div className="border border-[#C9A96E]/15 p-6">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Orders</div>
          <div className="text-[#F5F0E8]">{orders.length} placed</div>
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

      <h2 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8] mt-20 mb-8">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-[#8A8FA8] text-sm">No orders yet. The atelier is patient.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-[#C9A96E]/15 p-6" data-testid={`order-${o.id}`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">
                    Order · {o.id.slice(0, 8)}
                  </div>
                  <div className="text-[#F5F0E8] mt-1">{o.items.map((i) => i.name).join(" · ")}</div>
                  <div className="text-xs text-[#8A8FA8] mt-1">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#F5F0E8]">{formatINR(o.total)}</div>
                  {o.delhivery_awb ? (
                    <div>
                      <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-2">
                        AWB · {o.delhivery_awb}
                      </div>
                      
                        href={`https://www.delhivery.com/track-v2/package/${o.delhivery_awb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] tracking-[0.25em] uppercase gold-underline text-[#C9A96E] mt-1 inline-block"
                      >
                        Track Order ↗
                      </a>
                    </div>
                  ) : null}
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
