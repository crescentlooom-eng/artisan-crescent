import React, { useEffect, useState } from "react";
import { api, formatINR } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";

function AdjustModal({ row, onClose, onSaved }) {
  const [change, setChange] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!change) {
      toast.error("Enter a non-zero change");
      return;
    }
    setSaving(true);
    try {
      const r = await api.post("/admin/loom-credits/adjust", { user_id: row.user_id, change, note });
      toast.success(`Adjusted — new balance ${r.data.balance}`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Adjust failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0B0E1A] border border-[#C9A96E]/20 max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Adjust Cards</div>
        <h3 className="font-serif-display text-2xl text-[#F5F0E8] mb-1">{row.name}</h3>
        <div className="text-[#8A8FA8] text-sm mb-6">{row.email} · Current balance {row.balance}</div>

        <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Change (+ to add, − to deduct)</label>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => setChange(change - 1)} className="px-3 py-3 border border-[#C9A96E]/30 text-[#C9A96E]"><Minus size={14} /></button>
          <input
            type="number"
            value={change}
            onChange={(e) => setChange(parseInt(e.target.value || "0", 10))}
            data-testid="admin-loom-adjust-input"
            className="text-center"
          />
          <button onClick={() => setChange(change + 1)} className="px-3 py-3 border border-[#C9A96E]/30 text-[#C9A96E]"><Plus size={14} /></button>
        </div>

        <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] mt-6 block">Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for adjustment" />

        <div className="flex gap-3 mt-8">
          <button onClick={submit} disabled={saving} className="btn-gold flex-1 disabled:opacity-50" data-testid="admin-loom-adjust-save">
            {saving ? "Saving..." : "Apply Adjustment"}
          </button>
          <button onClick={onClose} className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] px-6">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function LoomCreditsAdmin() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [redeemedOrders, setRedeemedOrders] = useState([]);
  const [adjusting, setAdjusting] = useState(null);

  const refresh = async () => {
    const [s, r, o] = await Promise.all([
      api.get("/admin/loom-credits/summary"),
      api.get("/admin/loom-credits"),
      api.get("/admin/loom-credits/orders"),
    ]);
    setSummary(s.data);
    setRows(r.data);
    setRedeemedOrders(o.data);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="mt-8" data-testid="admin-loom-credits-pane">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Cards Issued", value: summary.issued },
            { label: "Cards Redeemed", value: summary.redeemed },
            { label: "Outstanding", value: summary.outstanding },
            { label: "Discount Given", value: formatINR(summary.discount_given_inr) },
          ].map((s) => (
            <div key={s.label} className="border border-[#C9A96E]/15 p-5" data-testid={`admin-loom-summary-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">{s.label}</div>
              <div className="font-serif-display text-3xl text-[#F5F0E8] mt-2">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <h3 className="font-serif-display text-2xl text-[#F5F0E8] mb-4">Customers</h3>
      {rows.length === 0 ? (
        <div className="text-[#8A8FA8] text-sm">No Loom Credit activity yet.</div>
      ) : (
        <div className="overflow-x-auto border border-[#C9A96E]/15">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] bg-[#11142A]">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Earned</th>
                <th className="p-4">Redeemed</th>
                <th className="p-4">Adjusted</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[#F5F0E8]/85">
              {rows.map((r) => (
                <tr key={r.user_id} className="border-t border-[#C9A96E]/10" data-testid={`admin-loom-row-${r.user_id}`}>
                  <td className="p-4">
                    <div className="text-[#F5F0E8]">{r.name}</div>
                    <div className="text-xs text-[#8A8FA8]">{r.email}</div>
                  </td>
                  <td className="p-4 font-serif-display text-xl text-[#C9A96E]">{r.balance}</td>
                  <td className="p-4">{r.total_earned}</td>
                  <td className="p-4">{r.total_redeemed}</td>
                  <td className="p-4">{r.total_adjusted >= 0 ? `+${r.total_adjusted}` : r.total_adjusted}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setAdjusting(r)} className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/80" data-testid={`admin-loom-adjust-${r.user_id}`}>
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="font-serif-display text-2xl text-[#F5F0E8] mt-12 mb-4">Orders with Redemption</h3>
      {redeemedOrders.length === 0 ? (
        <div className="text-[#8A8FA8] text-sm">No redemptions yet.</div>
      ) : (
        <div className="space-y-3">
          {redeemedOrders.map((o) => (
            <div key={o.id} className="border border-[#C9A96E]/15 p-5 grid md:grid-cols-5 gap-3" data-testid={`admin-loom-order-${o.id}`}>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Order</div>
                <div className="text-[#F5F0E8] text-sm mt-1">{o.id.slice(0,12)}</div>
                <div className="text-xs text-[#8A8FA8] mt-1">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Customer</div>
                <div className="text-[#F5F0E8] text-sm mt-1">{o.shipping?.full_name}</div>
                <div className="text-xs text-[#8A8FA8]">{o.email}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Cards Used</div>
                <div className="text-[#F5F0E8] text-lg mt-1">{o.loom_credits_redeemed}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Discount</div>
                <div className="text-[#C9A96E] text-lg mt-1">{formatINR(o.loom_credits_discount)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Total Paid</div>
                <div className="text-[#F5F0E8] text-lg mt-1">{formatINR(o.total)}</div>
                <div className={`text-[10px] tracking-[0.3em] uppercase mt-1 ${o.status === "paid" ? "text-[#C9A96E]" : "text-[#8A8FA8]"}`}>{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adjusting && <AdjustModal row={adjusting} onClose={() => setAdjusting(null)} onSaved={refresh} />}
    </div>
  );
}
