import React, { useEffect, useState } from "react";
import { api, formatINR } from "@/lib/api";
import { Search, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const STATUS_FLOW = ["placed", "packed", "shipped", "out_for_delivery", "delivered"];
const STATUS_LABEL = {
  pending: "Pending",
  placed: "Order Placed",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const ALL_STATUSES = ["pending", "placed", "paid", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [range, setRange] = useState("all");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/orders/search", { params: { window: range, q: q || undefined, status: statusFilter !== "all" ? statusFilter : undefined } });
      setOrders(r.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [range, statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); refresh(); };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated → ${STATUS_LABEL[newStatus]}`);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Update failed");
    }
  };

  const downloadCSV = async () => {
    try {
      const r = await api.get("/admin/orders.csv", { responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `crescent-loom-orders-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("CSV download failed");
    }
  };

  return (
    <div data-testid="admin-orders-page" className="page-fade">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-2">Orders</div>
          <h1 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8]">All orders, in order.</h1>
        </div>
        <button onClick={downloadCSV} data-testid="orders-csv-button" className="text-[11px] tracking-[0.3em] uppercase border border-[#C9A96E]/40 text-[#C9A96E] px-5 py-3 hover:bg-[#C9A96E] hover:text-[#0B0E1A] transition-colors flex items-center gap-2 self-start">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              data-testid={`orders-range-${r.value}`}
              className={`text-[11px] tracking-[0.25em] uppercase px-4 py-2 border transition-all ${
                range === r.value ? "border-[#C9A96E] text-[#C9A96E]" : "border-[#8A8FA8]/25 text-[#F5F0E8]/80"
              }`}
            >{r.label}</button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          data-testid="orders-status-filter"
          className="text-sm bg-transparent border border-[#C9A96E]/30 px-3 py-2 text-[#F5F0E8]"
        >
          <option value="all" className="bg-[#0B0E1A]">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s} className="bg-[#0B0E1A]">{STATUS_LABEL[s]}</option>)}
        </select>
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 border border-[#C9A96E]/25 px-3">
          <Search size={14} className="text-[#C9A96E]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order ID or customer name" data-testid="orders-search-input" className="flex-1 border-none py-2 text-sm" />
          <button type="submit" className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] px-2">Find</button>
        </form>
      </div>

      <div className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] mb-4">{loading ? "Loading..." : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}</div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((o) => {
          const isOpen = expanded === o.id;
          const items = o.items || [];
          const qty = items.reduce((s, i) => s + (i.quantity || 0), 0);
          const sizes = [...new Set(items.map((i) => i.size).filter(Boolean))].join(", ") || "—";
          return (
            <div key={o.id} className="border border-[#C9A96E]/15" data-testid={`order-row-${o.id}`}>
              <div className="grid grid-cols-12 gap-3 p-4 md:p-5 items-center">
                <div className="col-span-12 md:col-span-3">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]">#{o.id.slice(0,8)}</div>
                  <div className="text-[#F5F0E8] text-sm mt-1">{o.shipping?.full_name || o.email}</div>
                  <div className="text-xs text-[#8A8FA8]">{o.shipping?.phone || "—"}</div>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Items</div>
                  <div className="text-[#F5F0E8] text-sm mt-1 truncate">{items.map((i) => `${i.name} ×${i.quantity}`).join(", ") || "—"}</div>
                  <div className="text-xs text-[#8A8FA8]">Qty {qty} · Sizes {sizes}</div>
                </div>
                <div className="col-span-3 md:col-span-2">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Total</div>
                  <div className="text-[#F5F0E8] text-base mt-1">{formatINR(o.total)}</div>
                  {o.loom_credits_discount > 0 && <div className="text-[10px] text-[#C9A96E]">−{formatINR(o.loom_credits_discount)} loom</div>}
                </div>
                <div className="col-span-3 md:col-span-2">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Status</div>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    data-testid={`order-status-select-${o.id}`}
                    className="text-xs bg-transparent border-none p-0 mt-1 text-[#C9A96E] focus:border-none"
                  >
                    {ALL_STATUSES.map((s) => <option key={s} value={s} className="bg-[#0B0E1A] text-[#F5F0E8]">{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <div className="col-span-12 md:col-span-2 text-right">
                  <button onClick={() => setExpanded(isOpen ? null : o.id)} className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80 flex items-center gap-1 md:justify-end" data-testid={`order-toggle-${o.id}`}>
                    Details <ChevronDown size={12} className={isOpen ? "rotate-180" : ""} />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-[#C9A96E]/15 p-4 md:p-6 bg-[#11142A] grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Delivery Address</div>
                    <div className="text-[#F5F0E8]">
                      {o.shipping?.full_name}<br/>
                      {o.shipping?.address_line}<br/>
                      {o.shipping?.city}, {o.shipping?.state} {o.shipping?.pincode}<br/>
                      {o.shipping?.country}<br/>
                      {o.shipping?.phone && <span className="text-[#8A8FA8]">Phone: {o.shipping.phone}</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Items</div>
                    {items.map((i, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-[#C9A96E]/10 last:border-0">
                        <div>
                          <div className="text-[#F5F0E8]">{i.name}</div>
                          <div className="text-xs text-[#8A8FA8]">Size {i.size || "—"} · Qty {i.quantity}</div>
                        </div>
                        <div className="text-[#F5F0E8]">{formatINR(i.price * i.quantity)}</div>
                      </div>
                    ))}
                    <div className="flex justify-between mt-3 text-[#F5F0E8]/80"><span>Subtotal</span><span>{formatINR(o.subtotal)}</span></div>
                    {o.loom_credits_discount > 0 && (
                      <div className="flex justify-between text-[#C9A96E]"><span>Loom Credits ({o.loom_credits_redeemed})</span><span>−{formatINR(o.loom_credits_discount)}</span></div>
                    )}
                    <div className="flex justify-between mt-1 text-[#F5F0E8] font-medium"><span>Total</span><span>{formatINR(o.total)}</span></div>
                    <div className="text-xs text-[#8A8FA8] mt-3">Created {new Date(o.created_at).toLocaleString()}</div>
                    {o.razorpay_payment_id && <div className="text-[10px] text-[#8A8FA8] tracking-[0.15em]">Razorpay: {o.razorpay_payment_id}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-[#8A8FA8] text-sm">No orders in this view yet.</div>
        )}
      </div>
    </div>
  );
}
