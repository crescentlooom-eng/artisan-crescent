import React from "react";
import { Link } from "react-router-dom";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function AboutPage() {
  useScrollReveal();
  return (
    <div data-testid="about-page" className="page-fade">
      {/* Hero */}
      <section className="relative h-[80svh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1607300110506-273ab1cf41f8?crop=entropy&cs=srgb&fm=jpg" alt="Silk on dark" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E1A]/40 via-[#0B0E1A]/30 to-[#0B0E1A]" />
        <div className="noise-overlay" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-20">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">The House</div>
          <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl text-[#F5F0E8] max-w-4xl leading-[0.95]">
            We make few things,<br/>
            <span className="italic text-[#C9A96E]/90">but we make them slowly.</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-8">
          <p className="text-lg md:text-xl text-[#F5F0E8]/85 leading-relaxed reveal-up">
            Crescent Loom began in a small room above an old weaving shed, where the only sounds were the soft beat of the shuttle and the rustle of cloth being folded by hand. We are a small studio. We make a small number of things. We make them for people who notice the inside of a seam as much as the outside.
          </p>
          <p className="text-lg md:text-xl text-[#F5F0E8]/85 leading-relaxed reveal-up" style={{ transitionDelay: "100ms" }}>
            Our fabrics are spun from natural fibers — linen from European mills that still soak the flax in rivers, cotton woven on traditional Indian looms, silk from cocoons reeled in the cool early hours. Each piece is finished by hand, and each carries the quiet of the room it came from.
          </p>
          <p className="text-lg md:text-xl text-[#F5F0E8]/85 leading-relaxed reveal-up" style={{ transitionDelay: "200ms" }}>
            We do not chase seasons. We make twelve garments a year, then we make them again — better, if we can.
          </p>
        </div>
      </section>

      {/* Craft values bento */}
      <section className="py-20 md:py-32 border-t border-[#C9A96E]/10 bg-[#0B0E1A]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-stretch">
            <div className="col-span-12 md:col-span-7 reveal-up">
              <div className="product-card-img-wrap aspect-[5/4]">
                <img src="https://images.pexels.com/photos/6332002/pexels-photo-6332002.jpeg" alt="Loom" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="col-span-12 md:col-span-5 flex flex-col justify-center reveal-up" style={{ transitionDelay: "100ms" }}>
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">Craft</div>
              <h2 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] leading-[1.05]">The hand behind every thread.</h2>
              <p className="text-[#F5F0E8]/75 mt-6 leading-relaxed">
                Our partners in India and Italy work in studios of no more than ten people. Each looms, each cuts, each finishes. We pay above the local fair-trade floor, and we work in small runs so no one is rushed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            {[
              { t: "Natural Fibers", b: "Linen, silk, merino, organic cotton. Nothing synthetic, nothing throwaway." },
              { t: "Small Batches", b: "We weave in numbered runs of 40 to 80. When they're gone, they're gone." },
              { t: "Lifetime Care", b: "Send a piece back at any age and we'll mend or refresh it for you, by hand." },
            ].map((v, i) => (
              <div key={i} className="reveal-up" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">{`0${i+1}`}</div>
                <div className="font-serif-display text-2xl md:text-3xl text-[#F5F0E8]">{v.t}</div>
                <p className="text-[#F5F0E8]/75 mt-3 text-sm leading-relaxed">{v.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-24 flex justify-center">
            <Link to="/shop" data-testid="about-shop-cta" className="btn-gold">Enter the Atelier</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
