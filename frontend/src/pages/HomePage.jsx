import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, productImage } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import useScrollReveal from "@/hooks/useScrollReveal";

const HERO_BG = "https://images.unsplash.com/photo-1609062757924-6c2d01b3b422?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBlZGl0b3JpYWwlMjBmYXNoaW9uJTIwbW9vZHklMjBkYXJrfGVufDB8fHx8MTc4MDgyODI0OHww&ixlib=rb-4.1.0&q=85";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);

  useScrollReveal();

  useEffect(() => {
    (async () => {
      const [allRes, featRes] = await Promise.all([
        api.get("/products", { params: { new_arrival: true } }),
        api.get("/products", { params: { featured: true } }),
      ]);
      setProducts(allRes.data);
      setFeatured(featRes.data);
    })();
  }, []);

  const marqueeItems = [...products, ...products];

  return (
    <div data-testid="home-page" className="page-fade">
      {/* HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E1A]/60 via-[#0B0E1A]/30 to-[#0B0E1A]" />
        <div className="aura absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-[#C9A96E] opacity-10 blur-3xl" />
        <div className="noise-overlay" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-24 md:pb-32">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-6 reveal-up">Autumn / Winter — Volume IV</div>
          <h1 className="font-serif-display text-[#F5F0E8] text-5xl sm:text-7xl lg:text-[8rem] leading-[0.95] reveal-up" style={{ transitionDelay: "120ms" }}>
            Woven in<br/>
            <span className="italic text-[#C9A96E]/90">Moonlight</span>
          </h1>
          <p className="text-[#F5F0E8]/80 max-w-md mt-8 text-base md:text-lg leading-relaxed reveal-up" style={{ transitionDelay: "240ms" }}>
            A quiet wardrobe. Cut from natural fibers, made in small numbers, intended to last beyond the season.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 reveal-up" style={{ transitionDelay: "360ms" }}>
            <Link to="/shop" data-testid="home-hero-shop-cta" className="btn-gold">Enter the Collection</Link>
            <Link to="/about" data-testid="home-hero-about-cta" className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/85 gold-underline self-center">Our Philosophy</Link>
          </div>
        </div>
      </section>

      {/* MARQUEE NEW ARRIVALS */}
      <section className="py-20 md:py-28 border-y border-[#C9A96E]/10 bg-[#0B0E1A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">Just Arrived</div>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-[#F5F0E8]">New Pieces, Slowly Made</h2>
          </div>
          <Link to="/shop" data-testid="home-new-arrivals-link" className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/85 mb-2">View All</Link>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-8 marquee w-max">
            {marqueeItems.map((p, i) => (
              <Link to={`/product/${p.slug}`} key={`${p.id}-${i}`} className="w-[280px] md:w-[340px] flex-shrink-0">
                <div className="product-card-img-wrap product-card-halo aspect-[3/4] mb-4">
                  {productImage(p) ? (
                    <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8A8FA8] text-xs tracking-[0.3em] uppercase">Awaiting Image</div>
                  )}
                </div>
                <div className="flex items-center justify-between px-1">
                  <div className="font-serif-display text-xl text-[#F5F0E8]">{p.name}</div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8]">{p.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL ASYMMETRIC GRID */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3 reveal-up">Chapters</div>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-[#F5F0E8] max-w-3xl reveal-up" style={{ transitionDelay: "80ms" }}>
            Three lines. <span className="italic text-[#C9A96E]/90">One quiet wardrobe.</span>
          </h2>

          <div className="grid grid-cols-12 gap-6 md:gap-10 mt-16">
            <Link to="/shop?category=polo" data-testid="home-chapter-polo" className="col-span-12 md:col-span-7 group reveal-up">
              <div className="product-card-img-wrap aspect-[4/5] mb-5">
                <img src="https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/aimwehfu_beige%201.png" alt="Textured Polo Tee" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Chapter I</div>
                  <div className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8] mt-2">Textured Polo Tee</div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">Six tonal weaves · ₹399</div>
                </div>
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/85 gold-underline">Explore</span>
              </div>
            </Link>

            <div className="col-span-12 md:col-span-5 flex flex-col gap-10 md:pt-32">
              <Link to="/shop?category=designer" data-testid="home-chapter-designer" className="group reveal-up" style={{ transitionDelay: "100ms" }}>
                <div className="product-card-img-wrap aspect-[4/5] mb-5">
                  <img src="https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/t9hvhdc6_designer%20green%201.png" alt="Prism Wear Tee" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Chapter II</div>
                    <div className="font-serif-display text-3xl text-[#F5F0E8] mt-2">Prism Wear Tee</div>
                    <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">Ten designer prints · ₹349</div>
                  </div>
                  <span className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/85 gold-underline">Explore</span>
                </div>
              </Link>
            </div>

            <Link to="/shop?category=basics" data-testid="home-chapter-basics" className="col-span-12 md:col-span-6 md:col-start-4 group reveal-up" style={{ transitionDelay: "200ms" }}>
              <div className="product-card-img-wrap aspect-[5/4] mb-5">
                <img src="https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/dp4xzzoz_plain%20black%201%20.png" alt="Essential Tee" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Chapter III</div>
                  <div className="font-serif-display text-3xl text-[#F5F0E8] mt-2">Essential Tee</div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">Black & white · ₹299</div>
                </div>
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/85 gold-underline">Explore</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCT GRID */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 bg-[#0B0E1A] border-t border-[#C9A96E]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">Atelier Selects</div>
                <h2 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8]">Favorites of the House</h2>
              </div>
              <Link to="/shop" className="text-[11px] tracking-[0.3em] uppercase gold-underline text-[#F5F0E8]/85">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
              {featured.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* PHILOSOPHY */}
      <section className="py-24 md:py-40 relative overflow-hidden">
        <div className="noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-6">Philosophy</div>
          <p className="font-serif-display text-3xl md:text-5xl lg:text-6xl text-[#F5F0E8] leading-[1.15] italic font-light">
            &ldquo;We make few things, but we make them slowly. Each garment carries the hand that wove it, the quiet of the room it was finished in.&rdquo;
          </p>
          <div className="mt-12 text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">— The Atelier</div>
        </div>
      </section>
    </div>
  );
}
