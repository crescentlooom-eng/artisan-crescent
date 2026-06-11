import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PRODUCTS = [
  {
    name: "Textured Polo Tee",
    category: "Polo / Structured Tees",
    price: "₹399",
    slug: "textured-polo-tee",
    tag: "Chapter I",
    frames: Array.from({length:12}, (_,i) => `/tshirts/polo_${String(i).padStart(2,'0')}.jpg`),
  },
  {
    name: "Prism Wear Tee",
    category: "Designer / Graphic Tees",
    price: "₹349",
    slug: "prism-wear-tee",
    tag: "Chapter II",
    frames: Array.from({length:12}, (_,i) => `/tshirts/prism_${String(i).padStart(2,'0')}.jpg`),
  },
  {
    name: "Essential Tee",
    category: "Basics / Essentials",
    price: "₹299",
    slug: "essential-tee",
    tag: "Chapter III",
    frames: Array.from({length:12}, (_,i) => `/tshirts/essential_${String(i).padStart(2,'0')}.jpg`),
  },
];

export default function ScrollHero() {
  const sectionRef = useRef(null);
  const [productIdx, setProductIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [imgOpacity, setImgOpacity] = useState(1);

  useEffect(() => {
    // Preload all images
    PRODUCTS.forEach(p => p.frames.forEach(src => { const img = new Image(); img.src = src; }));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionH = section.offsetHeight;
      const scrolled = -rect.top;
      if (scrolled < 0 || scrolled > sectionH) return;

      const progress = scrolled / sectionH; // 0 to 1
      const totalProducts = PRODUCTS.length;
      const perProduct = 1 / totalProducts;

      const pIdx = Math.min(Math.floor(progress / perProduct), totalProducts - 1);
      const localProgress = (progress - pIdx * perProduct) / perProduct;
      const fIdx = Math.min(Math.floor(localProgress * 12), 11);

      if (pIdx !== productIdx) {
        setTransitioning(true);
        setImgOpacity(0);
        setTimeout(() => {
          setProductIdx(pIdx);
          setFrameIdx(0);
          setImgOpacity(1);
          setTransitioning(false);
        }, 300);
      } else {
        setFrameIdx(fIdx);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [productIdx]);

  const product = PRODUCTS[productIdx];
  const currentFrame = product.frames[frameIdx];

  return (
    <section ref={sectionRef} style={{ height: "350vh" }} className="relative">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0B0E1A] flex items-center justify-center">

        {/* Background aura */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)" }} />
        </div>

        {/* Left — text */}
        <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 z-10 max-w-xs">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4"
            style={{ transition: "opacity 0.4s ease", opacity: transitioning ? 0 : 1 }}>
            {product.tag}
          </div>
          <h2 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] leading-tight"
            style={{ transition: "opacity 0.4s ease, transform 0.4s ease", opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(10px)" : "translateY(0)" }}>
            {product.name.split(" ").map((w, i) => (
              <span key={i} className={i === product.name.split(" ").length - 1 ? "italic text-[#C9A96E]/90" : ""}>{w} </span>
            ))}
          </h2>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] mt-4"
            style={{ transition: "opacity 0.4s ease", opacity: transitioning ? 0 : 1 }}>
            {product.category}
          </div>
          <div className="text-2xl text-[#F5F0E8] mt-2"
            style={{ transition: "opacity 0.4s ease", opacity: transitioning ? 0 : 1 }}>
            {product.price}
          </div>
          <Link to={`/product/${product.slug}`}
            className="inline-block mt-6 btn-gold text-xs"
            style={{ transition: "opacity 0.4s ease", opacity: transitioning ? 0 : 1 }}>
            Explore
          </Link>
        </div>

        {/* Center — tshirt image */}
        <div className="relative z-10 flex items-center justify-center"
          style={{ opacity: imgOpacity, transition: "opacity 0.3s ease" }}>
          <img
            src={currentFrame}
            alt={product.name}
            className="object-contain select-none"
            style={{ height: "70vh", maxHeight: "600px", width: "auto", userSelect: "none", pointerEvents: "none" }}
            draggable={false}
          />
        </div>

        {/* Right — product dots */}
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
          {PRODUCTS.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-300 ${i === productIdx ? "text-[#C9A96E]" : "text-[#8A8FA8]/40"}`}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className={`h-px transition-all duration-300 ${i === productIdx ? "w-8 bg-[#C9A96E]" : "w-3 bg-[#8A8FA8]/30"}`} />
            </div>
          ))}
        </div>

        {/* Bottom — scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#8A8FA8]">Scroll to explore</div>
          <div className="w-px h-8 bg-gradient-to-b from-[#C9A96E]/60 to-transparent animate-pulse" />
        </div>

        {/* Frame progress bar */}
        <div className="absolute bottom-0 left-0 h-px bg-[#C9A96E]/20 w-full">
          <div className="h-full bg-[#C9A96E]/60 transition-all duration-100"
            style={{ width: `${((productIdx * 12 + frameIdx) / 36) * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
