import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-[#C9A96E]/10 bg-[#0B0E1A] text-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="font-serif-display text-3xl md:text-4xl leading-tight">
            Crafted in Silence.<br/>
            <span className="text-[#C9A96E]">Worn with Intention.</span>
          </div>
          <p className="text-[#8A8FA8] text-sm mt-6 max-w-md leading-relaxed">
            Slow-made garments from natural fibers, woven in small batches across India and Europe.
          </p>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">Shop</div>
          <ul className="space-y-2 text-sm text-[#F5F0E8]/75">
            <li><Link to="/shop?category=polo" className="hover:text-[#C9A96E]">Polo</Link></li>
            <li><Link to="/shop?category=designer" className="hover:text-[#C9A96E]">Designer</Link></li>
            <li><Link to="/shop?category=basics" className="hover:text-[#C9A96E]">Basics</Link></li>
            <li><Link to="/shop" className="hover:text-[#C9A96E]">All Pieces</Link></li>
          </ul>
        </div>
       <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">House</div>
          <ul className="space-y-2 text-sm text-[#F5F0E8]/75">
            <li><Link to="/about" className="hover:text-[#C9A96E]">About</Link></li>
            <li><Link to="/wishlist" className="hover:text-[#C9A96E]">Wishlist</Link></li>
            <li><Link to="/account" className="hover:text-[#C9A96E]">Account</Link></li>
            <li><Link to="/returns" className="hover:text-[#C9A96E]">Returns & Exchanges</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#C9A96E]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] tracking-[0.25em] uppercase text-[#8A8FA8]">
          <div>© {new Date().getFullYear()} Crescent Loom</div>
          <div>Made slowly. Worn endlessly.</div>
        </div>
      </div>
    </footer>
  );
}
