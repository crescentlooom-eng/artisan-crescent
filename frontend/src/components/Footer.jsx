import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
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
              <li><Link to="/shipping" className="hover:text-[#C9A96E]">Shipping Info</Link></li>
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

      
          href="https://wa.me/919810924300"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
