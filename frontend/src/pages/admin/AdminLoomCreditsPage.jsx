import React from "react";
import LoomCreditsAdmin from "@/components/admin/LoomCreditsAdmin";

export default function AdminLoomCreditsPage() {
  return (
    <div data-testid="admin-loom-credits-page" className="page-fade">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">Loyalty</div>
      <h1 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8] mb-2">Loom Credits</h1>
      <p className="text-sm text-[#8A8FA8]">Track cards issued, redeemed, and outstanding across every customer.</p>
      <LoomCreditsAdmin />
    </div>
  );
}
