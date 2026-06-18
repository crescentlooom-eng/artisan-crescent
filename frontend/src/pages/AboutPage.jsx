import React from "react";
import { Link } from "react-router-dom";
import useScrollReveal from "@/hooks/useScrollReveal";

const TEAM = [
  { name: "Raghav Malhotra", role: "Co-Founder" },
  { name: "Yogansh Gandhi", role: "Co-Founder" },
  { name: "Kinshuk Malhotra", role: "Co-Founder" },
];

export default function AboutPage() {
  useScrollReveal();

  return (
    <div data-testid="about-page" className="page-fade">

      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="aura absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-[#C9A96E] opacity-5 blur-3xl pointer-events-none" />
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-6 reveal-up">Our Story</div>
        <h1 className="font-serif-display text-5xl sm:text-7xl lg:text-[7rem] text-[#F5F0E8] leading-[0.95] max-w-5xl reveal-up" style={{ transitionDelay: "80ms" }}>
          Crafted in<br />
          <span className="italic text-[#C9A96E]/90">Silence.</span>
        </h1>
        <p className="text-[#F5F0E8]/70 max-w-xl mt-10 text-base md:text-lg leading-relaxed reveal-up" style={{ transitionDelay: "160ms" }}>
          Born in April 2026, Crescent Loom is a quiet rebellion against the noise of fast fashion — a belief that clothing should be made with greater intention.
        </p>
      </section>

      {/* Divider */}
      <div className="divider-thin max-w-7xl mx-auto px-6 md:px-12" />

      {/* Why We Started */}
      <section className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-5 reveal-up">
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Why We Started</div>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] leading-tight">
              In a world of mass production, we chose to <span className="italic text-[#C9A96E]/90">slow down.</span>
            </h2>
          </div>
          <div className="md:col-span-7 reveal-up" style={{ transitionDelay: "120ms" }}>
            <p className="text-[#F5F0E8]/75 text-base md:text-lg leading-relaxed mb-6">
              We started Crescent Loom because we believed clothing should be made with greater intention. In a world of fast fashion and mass production, we wanted to create garments that prioritize quality, comfort, and timeless design.
            </p>
            <p className="text-[#F5F0E8]/75 text-base md:text-lg leading-relaxed">
              Every piece is thoughtfully crafted using natural fabrics and small-batch production, ensuring that what you wear feels as good as it looks. Crescent Loom is our commitment to creating clothing that lasts beyond seasons and trends.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-thin max-w-7xl mx-auto px-6 md:px-12" />

      {/* What Makes Us Different */}
      <section className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4 reveal-up">Our Craft</div>
        <h2 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] max-w-2xl leading-tight reveal-up" style={{ transitionDelay: "80ms" }}>
          Fabric chosen. Form considered. <span className="italic text-[#C9A96E]/90">Nothing wasted.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              title: "Natural Fabrics",
              body: "We carefully select quality fabrics that feel soft, breathe naturally, and maintain their shape over time.",
            },
            {
              title: "Small Batch",
              body: "Every piece is produced in limited quantities — enough to maintain quality, not enough to contribute to excess.",
            },
            {
              title: "Built to Last",
              body: "Every piece is designed to be worn repeatedly, not replaced after a few washes. Timeless over trend.",
            },
          ].map((item, i) => (
            <div key={item.title} className="border-t border-[#C9A96E]/20 pt-8 reveal-up" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="font-serif-display text-2xl text-[#F5F0E8] mb-4">{item.title}</div>
              <p className="text-[#F5F0E8]/65 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="divider-thin max-w-7xl mx-auto px-6 md:px-12" />

      {/* Vision */}
      <section className="py-24 md:py-40 relative overflow-hidden">
        <div className="noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative reveal-up">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-6">Our Vision</div>
          <p className="font-serif-display text-3xl md:text-5xl text-[#F5F0E8] leading-[1.15] italic font-light">
            &ldquo;To build a world where clothing is chosen with intention, crafted with care, and valued for years.&rdquo;
          </p>
          <p className="text-[#F5F0E8]/60 mt-8 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            We envision Crescent Loom becoming a symbol of timeless design, exceptional quality, and conscious craftsmanship — creating garments that outlast trends and become a meaningful part of everyday life.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-thin max-w-7xl mx-auto px-6 md:px-12" />

      {/* Team */}
      <section className="py-24 md:py-36 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4 reveal-up">Triad</div>
        <h2 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] reveal-up" style={{ transitionDelay: "80ms" }}>
          Three people. <span className="italic text-[#C9A96E]/90">One quiet vision.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {TEAM.map((member, i) => (
            <div key={member.name} className="border border-[#C9A96E]/15 p-8 reveal-up" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center mb-6">
                <span className="font-serif-display text-xl text-[#C9A96E]">{member.name[0]}</span>
              </div>
              <div className="font-serif-display text-2xl text-[#F5F0E8]">{member.name}</div>
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mt-2">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-[#C9A96E]/10 bg-[#0B0E1A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">The Collection</div>
            <h3 className="font-serif-display text-4xl text-[#F5F0E8]">Wear the <span className="italic text-[#C9A96E]/90">intention.</span></h3>
          </div>
          <Link to="/shop" className="btn-gold whitespace-nowrap">Enter the Collection</Link>
        </div>
      </section>

    </div>
  );
}
