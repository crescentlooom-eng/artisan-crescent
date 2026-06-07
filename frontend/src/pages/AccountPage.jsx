import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoomCreditsCard from "@/components/LoomCreditsCard";

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
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">Welcome, <span className="italic text-[#C9A96E]/90">{user.name.split(" ")[0]}</span></h1>
        <button onClick={logout} data-testid="account-logout-button" className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80 self-start md:self-auto">Sign Out</button>
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
            <div key={o.id} className="border border-[#C9A96E]/15 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3" data-testid={`order-${o.id}`}>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Order · {o.id.slice(0,8)}</div>
                <div className="text-[#F5F0E8] mt-1">{o.items.map((i) => i.name).join(" · ")}</div>
                <div className="text-xs text-[#8A8FA8] mt-1">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[#F5F0E8]">{formatINR(o.total)}</div>
                <div className={`text-[11px] tracking-[0.3em] uppercase mt-1 ${o.status === "paid" ? "text-[#C9A96E]" : "text-[#8A8FA8]"}`}>{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
