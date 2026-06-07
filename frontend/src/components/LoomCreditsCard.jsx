import React from "react";
import { Sparkle } from "lucide-react";
import { formatINR } from "@/lib/api";

export default function LoomCreditsCard({ data }) {
  if (!data) return null;
  const { balance, value_inr, min_redeem, can_redeem, cards_needed_to_redeem, history } = data;

  return (
    <div data-testid="loom-credits-card" className="border border-[#C9A96E]/20 bg-gradient-to-b from-[#0B0E1A] to-[#11142A] p-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#C9A96E] opacity-[0.06] blur-3xl" />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
            <Sparkle size={14} /> Loom Credits
          </div>
          <h2 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8] leading-tight">
            You have <span className="text-[#C9A96E]">{balance}</span> Loom Credit {balance === 1 ? "Card" : "Cards"}
          </h2>
          <p className="text-[#F5F0E8]/80 mt-3 text-lg">
            Worth <span className="text-[#C9A96E]">{formatINR(value_inr)}</span> at checkout.
          </p>
        </div>
      </div>

      <div className="mt-6 relative">
        {can_redeem ? (
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">You&rsquo;re eligible to redeem.</div>
        ) : (
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">
            Collect <span className="text-[#C9A96E]">{cards_needed_to_redeem}</span> more {cards_needed_to_redeem === 1 ? "card" : "cards"} to redeem
          </div>
        )}
        <p className="text-[#F5F0E8]/65 text-sm mt-4 leading-relaxed max-w-xl">
          Every order includes a Loom Credit Card in the package — 1 card = ₹5 off. Collect at least {min_redeem} to redeem.
        </p>
      </div>

      {history?.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#C9A96E]/15 relative">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">History</div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {history.map((t) => (
              <div key={t.id} className="flex items-start justify-between text-sm" data-testid={`loom-history-${t.id}`}>
                <div>
                  <div className="text-[#F5F0E8] capitalize">{t.reason.replace("_", " ")}</div>
                  {t.note && <div className="text-[#8A8FA8] text-xs mt-0.5">{t.note}</div>}
                  <div className="text-[#8A8FA8] text-[10px] tracking-[0.15em] uppercase mt-1">{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div className={`font-serif-display text-xl ${t.change >= 0 ? "text-[#C9A96E]" : "text-[#F5F0E8]/85"}`}>
                  {t.change >= 0 ? "+" : ""}{t.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
