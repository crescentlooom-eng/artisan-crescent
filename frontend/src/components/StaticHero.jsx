import React from "react";
import { Link } from "react-router-dom";

const HERO_IMG = "https://images.unsplash.com/photo-1609062757924-6c2d01b3b422?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBlZGl0b3JpYWwlMjBmYXNoaW9uJTIwbW9vZHklMjBkYXJrfGVufDB8fHx8MTc4MDgyODI0OHww&ixlib=rb-4.1.0&q=85";

export default function StaticHero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#0B0E1A]">
      <img
        src={HERO_IMG}
        alt="Crescent Loom"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,14,26,0.45) 0%, rgba(11,14,26,0.15) 40%, rgba(11,14,26,0.9) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-start justify-end pb-20 px-8 md:px-16 z-10">
        <div className="text-[11px] tracking-[0.5em] uppercase text-[#C9A96E] mb-4">
          Autumn / Winter — Volume IV
        </div>
        <h1 className="font-serif-display text-6xl md:text-8xl text-[#F5F0E8] leading-[0.95]">
          Woven in<br />
          <span className="italic text-[#C9A96E]/90">Moonlight</span>
        </h1>
        <p className="text-[#F5F0E8]/70 mt-6 text-base md:text-lg leading-relaxed max-w-md font-light">
          A quiet wardrobe. Cut from natural fibers, made in small numbers, intended to last beyond the season.
        </p>
        <div className="mt-8 flex gap-6">
          <Link to="/shop" className="btn-gold text-xs">Enter the Collection</Link>
          <Link to="/about" className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/60 gold-underline self-center">Our Philosophy</Link>
        </div>
        <div className="mt-12 text-[11px] tracking-[0.4em] uppercase text-[#C9A96E]/50">
          Crescent Loom
        </div>
      </div>
    </section>
  );
}
