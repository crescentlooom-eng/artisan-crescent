import React, { useEffect, useState } from "react";
import { api, formatINR } from "@/lib/api";
import { ChevronRight, X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

function CustomerDetail({ userId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [change, setChange] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await api.get(`/admin/customers/${userId}`);
    setData(r.data);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const applyAdjust = async () => {
    if (!change) return toast.error("Enter a non-zero change");
    setSaving(true);
    try {
      await api.post("/admin/loom-credits/adjust", { user_id: userId, change, note });
      toast.success("Loom Credits adjusted");
      setAdjustOpen(false);
      setChange(1); setNote("");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Adjust failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#0B0E1A] border border-[#C9A96E]/25 max-w-3xl w-full" onClick={(e) => e.stopPropagation()} data-testid="customer-detail-modal">
        {!data ? (
          <div className="p-12 text-center text-[#8A8FA8] tracking-[0.3em] uppercase text-xs">Loading customer...</div>
        ) : (
          <>
            <div className="flex items-start justify-between p-6 border-b border-[#C9A96E]/15">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Customer</div>
                <h3 className="font-serif-display text-2xl md:text-3xl text-[#F5F0E8] mt-1">{data.user.name}</h3>
                <div className="text-sm text-[#8A8FA8] mt-1">{data.user.email}</div>
              </div>
              <button onClick={onClose} className="text-[#8A8FA8] hover:text-[#C9A96E]"><X /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-6">
              <div className="border border-[#C9A96E]/15 p-4">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]">Orders</div>
                <div className="font-serif-display text-2xl text-[#F5F0E8] mt-1">{data.orders_count}</div>
              </div>
              <div className="border border-[#C9A96E]/15 p-4">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]">Total Spent</div>
                <div className="font-serif-display text-2xl text-[#F5F0E8] mt-1">{formatINR(data.total_spent)}</div>
              </div>
              <div className="border border-[#C9A96E]/15 p-4">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]">Loom Cards</div>
                <div className="font-serif-display text-2xl text-[#C9A96E] mt-1">{data.loom_balance}</div>
                <button onClick={() => setAdjustOpen((v) => !v)} className="text-[10px] tracking-[0.3em] uppercase mt-2 gold-underline text-[#F5F0E8]/80" data-testid="customer-loom-adjust-toggle">
                  Adjust
                </button>
              </div>
            </div>
            {adjustOpen && (
              <div className="mx-6 mb-4 border border-[#C9A96E]/30 p-4">
                <label className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Change (+ add, − deduct)</label>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => setChange(change - 1)} className="px-2 py-2 border border-[#C9A96E]/30 text-[#C9A96E]"><Minus size={12} /></button>
                  <input type="number" value={change} onChange={(e) => setChange(parseInt(e.target.value || "0", 10))} className="text-center" data-testid="customer-loom-change-input"/>
                  <button onClick={() => setChange(change + 1)} className="px-2 py-2 border border-[#C9A96E]/30 text-[#C9A96E]"><Plus size={12} /></button>
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" className="mt-3" />
                <button onClick={applyAdjust} disabled={saving} data-testid="customer-loom-apply" className="btn-gold w-full mt-4 disabled:opacity-50">{saving ? "Applying..." : "Apply"}</button>
              </div>
            )}
            <div className="px-6 pb-6">
              <h4 className="font-serif-display text-xl text-[#F5F0E8] mb-3 mt-2">Order History</h4>
              {data.orders.length === 0 ? (
                <div className="text-[#8A8FA8] text-sm">No orders yet.</div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {data.orders.map((o) => (
                    <div key={o.id} className="border border-[#C9A96E]/10 p-3 grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-12 md:col-span-4">
                        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]">#{o.id.slice(0,8)}</div>
                        <div className="text-xs text-[#8A8FA8]">{new Date(o.created_at).toLocaleString()}</div>
                      </div>
                      <div className="col-span-8 md:col-span-5 text-[#F5F0E8]/85 truncate">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</div>
                      <div className="col-span-2 md:col-span-2 text-[#F5F0E8]">{formatINR(o.total)}</div>
                      <div className="col-span-2 md:col-span-1 text-right text-[10px] tracking-[0.25em] uppercase text-[#C9A96E]">{o.status.replace("_", " ")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const r = await api.get("/admin/customers");
    setRows(r.data);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (c.name || "").toLowerCase().includes(s) || (c.email || "").toLowerCase().includes(s) || (c.phone || "").includes(s);
  });

  return (
    <div data-testid="admin-customers-page" className="page-fade">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">Customers</div>
      <h1 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8]">Everyone who&rsquo;s touched the loom.</h1>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone…" className="mt-8 max-w-md" data-testid="customers-search-input" />

      <div className="mt-8 border border-[#C9A96E]/15 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] bg-[#11142A]">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Loom</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-[#F5F0E8]/85">
            {filtered.map((c) => (
              <tr key={c.user_id} className="border-t border-[#C9A96E]/10 hover:bg-[#C9A96E]/5 cursor-pointer" onClick={() => setSelected(c.user_id)} data-testid={`customer-row-${c.user_id}`}>
                <td className="p-4 text-[#F5F0E8]">{c.name}</td>
                <td className="p-4 text-xs">{c.email}</td>
                <td className="p-4 text-xs">{c.phone || "—"}</td>
                <td className="p-4">{c.orders_count}</td>
                <td className="p-4">{formatINR(c.total_spent)}</td>
                <td className="p-4 text-[#C9A96E]">{c.loom_balance}</td>
                <td className="p-4 text-right text-[#C9A96E]"><ChevronRight size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-[#8A8FA8] text-sm">No customers found.</div>}
      </div>

      {selected && <CustomerDetail userId={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
}
