import React, { useEffect, useState } from "react";
import { api, formatINR } from "@/lib/api";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ShoppingBag, Users, Clock, Sparkle, TrendingUp, Crown } from "lucide-react";

const RANGES = [
  { value: "day", label: "24 Hours" },
  { value: "week", label: "7 Days" },
  { value: "month", label: "30 Days" },
];

function StatCard({ icon: Icon, label, value, sub, testId }) {
  return (
    <div className="border border-[#B8C0C8]/15 p-5 md:p-6" data-testid={testId}>
      <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-[#B8C0C8]">
        <Icon size={14} /> {label}
      </div>
      <div className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8] mt-2">{value}</div>
      {sub && <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [revRange, setRevRange] = useState("week");
  const [series, setSeries] = useState([]);

  useEffect(() => {
    api.get("/admin/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get(`/admin/dashboard/revenue?window=${revRange}`).then((r) => setSeries(r.data)).catch(() => {});
  }, [revRange]);

  if (!stats) {
    return <div className="text-[#8A8FA8] text-sm tracking-[0.3em] uppercase">Loading dashboard...</div>;
  }

  return (
    <div data-testid="admin-dashboard" className="page-fade">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#B8C0C8] mb-3">Atelier Overview</div>
      <h1 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] leading-[1.05]">A glance at <span className="italic text-[#B8C0C8]/90">the house</span></h1>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-10">
        <StatCard icon={ShoppingBag} label="Today" value={stats.today.orders} sub={`${formatINR(stats.today.revenue)} revenue`} testId="stat-today" />
        <StatCard icon={ShoppingBag} label="This Week" value={stats.week.orders} sub={`${formatINR(stats.week.revenue)} revenue`} testId="stat-week" />
        <StatCard icon={ShoppingBag} label="This Month" value={stats.month.orders} sub={`${formatINR(stats.month.revenue)} revenue`} testId="stat-month" />
        <StatCard icon={Clock} label="Pending" value={stats.pending_orders} sub="awaiting fulfilment" testId="stat-pending" />
        <StatCard icon={Users} label="Customers" value={stats.total_customers} sub="registered" testId="stat-customers" />
        <StatCard icon={Crown} label="Top Piece" value={stats.top_product?.qty ?? 0} sub={stats.top_product?.name || "—"} testId="stat-top-product" />
        <StatCard icon={Sparkle} label="Loom Issued" value={stats.loom_credits?.issued || 0} sub="cards distributed" testId="stat-loom-issued" />
        <StatCard icon={Sparkle} label="Loom Redeemed" value={stats.loom_credits?.redeemed || 0} sub="cards used" testId="stat-loom-redeemed" />
      </div>

      {/* Revenue chart */}
      <div className="mt-12 border border-[#B8C0C8]/15 p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#B8C0C8] flex items-center gap-2"><TrendingUp size={14}/> Revenue</div>
            <h3 className="font-serif-display text-2xl md:text-3xl text-[#F5F0E8] mt-1">Over the last {RANGES.find((r) => r.value === revRange)?.label.toLowerCase()}</h3>
          </div>
          <div className="flex gap-1 border border-[#B8C0C8]/20 self-start md:self-auto">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRevRange(r.value)}
                data-testid={`revenue-range-${r.value}`}
                className={`text-[10px] tracking-[0.25em] uppercase px-4 py-2 transition-all ${
                  revRange === r.value ? "bg-[#B8C0C8] text-[#0B0E1A]" : "text-[#F5F0E8]/80 hover:text-[#B8C0C8]"
                }`}
              >{r.label}</button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B8C0C8" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#B8C0C8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(184,192,200,0.08)" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="label" stroke="#8A8FA8" tick={{ fontSize: 11, letterSpacing: "0.1em" }} axisLine={false} tickLine={false} />
              <YAxis stroke="#8A8FA8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${Math.round(v/1000)}k` : v} />
              <Tooltip
                contentStyle={{ background: "#0B0E1A", border: "1px solid rgba(184,192,200,0.3)", color: "#F5F0E8", fontFamily: "DM Sans" }}
                labelStyle={{ color: "#B8C0C8", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}
                formatter={(v, name) => name === "revenue" ? [formatINR(v), "Revenue"] : [v, "Orders"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#B8C0C8" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
