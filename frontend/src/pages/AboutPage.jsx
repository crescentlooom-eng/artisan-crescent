import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, PenTool, Heart } from "lucide-react";
import useScrollReveal from "@/hooks/useScrollReveal";

const TEAM = [
  { name: "Raghav Malhotra", role: "Co-Founder" },
  { name: "Yogansh Gandhi", role: "Co-Founder" },
  { name: "Kinshuk Malhotra", role: "Co-Founder" },
];

const HERO_IMG = "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/t9hvhdc6_designer%20green%201.png";

export default function AboutPage() {
  useScrollReveal();

  return (
    <div data-testid="about-page" className="page-fade pt-28 md:pt-32 pb-24">
      <div className="max-w-none mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: "var(--cl-subtext)" }}>
          <Link to="/" className="hover:text-[#C9A96E]">Home</Link> <span className="mx-2">/</span>
          <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>About Us</span>
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="reveal-up">
            <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>About Us</h1>
            <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--cl-subtext)" }}>
              Crescent Loom was founded with a simple belief — great style should be accessible, comfortable, and made to last.
            </p>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--cl-subtext)" }}>
              We craft premium essentials that blend minimal design with thoughtful details. Every piece is made with love, for those who value quality and authenticity.
            </p>
          </div>
          <div className="reveal-up rounded-2xl overflow-hidden" style={{ transitionDelay: "100ms" }}>
            <img src={HERO_IMG} alt="Crescent Loom" className="w-full h-full object-cover" style={{ aspectRatio: "4/3" }} />
          </div>
        </div>

        {/* Quick features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            { Icon: Sparkles, title: "Quality First", body: "We never compromise on quality." },
            { Icon: PenTool, title: "Timeless Design", body: "Minimal today, relevant tomorrow." },
            { Icon: Heart, title: "Made for You", body: "Crafted to elevate your everyday." },
          ].map((item, i) => (
            <div key={item.title} className="reveal-up" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--cl-surface)" }}>
                <item.Icon size={16} style={{ color: "#C9A96E" }} />
              </div>
              <div className="font-serif-display text-xl mb-2" style={{ color: "var(--cl-text)" }}>{item.title}</div>
              <p className="text-sm" style={{ color: "var(--cl-subtext)" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="divider-thin max-w-none mx-auto px-6 md:px-12 mt-20" />

      {/* Why We Started */}
      <section className="py-24 md:py-32 max-w-none mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-5 reveal-up">
            <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "#C9A96E" }}>Why We Started</div>
            <h2 className="font-serif-display text-4xl md:text-5xl leading-tight" style={{ color: "var(--cl-text)" }}>
              In a world of mass production, we chose to <span className="italic" style={{ color: "#C9A96E" }}>slow down.</span>
            </h2>
          </div>
          <div className="md:col-span-7 reveal-up" style={{ transitionDelay: "120ms" }}>
            <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: "var(--cl-subtext)" }}>
              We started Crescent Loom because we believed clothing should be made with greater intention. In a world of fast fashion and mass production, we wanted to create garments that prioritize quality, comfort, and timeless design.
            </p>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--cl-subtext)" }}>
              Every piece is thoughtfully crafted using natural fabrics and small-batch production, ensuring that what you wear feels as good as it looks. Crescent Loom is our commitment to creating clothing that lasts beyond seasons and trends.
            </p>
          </div>
        </div>
      </section>

      <div className="divider-thin max-w-none mx-auto px-6 md:px-12" />

      {/* What Makes Us Different */}
      <section className="py-24 md:py-32 max-w-none mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.4em] uppercase mb-4 reveal-up" style={{ color: "#C9A96E" }}>Our Craft</div>
        <h2 className="font-serif-display text-4xl md:text-5xl max-w-2xl leading-tight reveal-up" style={{ color: "var(--cl-text)", transitionDelay: "80ms" }}>
          Fabric chosen. Form considered. <span className="italic" style={{ color: "#C9A96E" }}>Nothing wasted.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { title: "Natural Fabrics", body: "We carefully select quality fabrics that feel soft, breathe naturally, and maintain their shape over time." },
            { title: "Small Batch", body: "Every piece is produced in limited quantities — enough to maintain quality, not enough to contribute to excess." },
            { title: "Built to Last", body: "Every piece is designed to be worn repeatedly, not replaced after a few washes. Timeless over trend." },
          ].map((item, i) => (
            <div key={item.title} className="border-t pt-8 reveal-up" style={{ borderColor: "rgba(201,169,110,0.2)", transitionDelay: `${i * 100}ms` }}>
              <div className="font-serif-display text-2xl mb-4" style={{ color: "var(--cl-text)" }}>{item.title}</div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--cl-subtext)" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-thin max-w-none mx-auto px-6 md:px-12" />

      {/* Vision */}
      <section className="py-24 md:py-36" style={{ background: "var(--cl-surface)" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center reveal-up">
          <div className="text-[11px] tracking-[0.4em] uppercase mb-6" style={{ color: "#C9A96E" }}>Our Vision</div>
          <p className="font-serif-display text-3xl md:text-5xl leading-[1.15] italic font-light" style={{ color: "var(--cl-text)" }}>
            &ldquo;To build a world where clothing is chosen with intention, crafted with care, and valued for years.&rdquo;
          </p>
          <p className="mt-8 text-sm md:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--cl-subtext)" }}>
            We envision Crescent Loom becoming a symbol of timeless design, exceptional quality, and conscious craftsmanship — creating garments that outlast trends and become a meaningful part of everyday life.
          </p>
        </div>
      </section>

      <div className="divider-thin max-w-none mx-auto px-6 md:px-12" />

      {/* Team */}
      <section className="py-24 md:py-32 max-w-none mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.4em] uppercase mb-4 reveal-up" style={{ color: "#C9A96E" }}>Triad</div>
        <h2 className="font-serif-display text-4xl md:text-5xl reveal-up" style={{ color: "var(--cl-text)", transitionDelay: "80ms" }}>
          Three people. <span className="italic" style={{ color: "#C9A96E" }}>One quiet vision.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {TEAM.map((member, i) => (
            <div key={member.name} className="border p-8 reveal-up" style={{ borderColor: "rgba(201,169,110,0.15)", transitionDelay: `${i * 100}ms` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)" }}>
                <span className="font-serif-display text-xl" style={{ color: "#C9A96E" }}>{member.name[0]}</span>
              </div>
              <div className="font-serif-display text-2xl" style={{ color: "var(--cl-text)" }}>{member.name}</div>
              <div className="text-[11px] tracking-[0.3em] uppercase mt-2" style={{ color: "#C9A96E" }}>{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t" style={{ borderColor: "rgba(201,169,110,0.1)", background: "var(--cl-bg)" }}>
        <div className="max-w-none mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-[11px] tracking-[0.4em] uppercase mb-3" style={{ color: "#C9A96E" }}>The Collection</div>
            <h3 className="font-serif-display text-4xl" style={{ color: "var(--cl-text)" }}>Wear the <span className="italic" style={{ color: "#C9A96E" }}>intention.</span></h3>
          </div>
          <Link to="/shop" className="btn-gold whitespace-nowrap">Enter the Collection</Link>
        </div>
      </section>
    </div>
  );
}
