import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productImage, expandForCatalog } from "@/lib/api";
import { listProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import useScrollReveal from "@/hooks/useScrollReveal";
import Hero from "@/components/Hero";
import ChapterCard from "@/components/ChapterCard";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const { user } = useAuth();

  useScrollReveal([featured]);

  useEffect(() => {
    setProducts(listProducts({ new_arrival: true }));
    setFeatured(listProducts({ featured: true }));
  }, []);

  useEffect(() => {
    if (!user) return;
    const key = `greeting_shown_${user.user_id}`;
    if (sessionStorage.getItem(key)) return;
    const t = setTimeout(() => {
      setShowGreeting(true);
      sessionStorage.setItem(key, "1");
      setTimeout(() => setShowGreeting(false), 3500);
    }, 4500);
    return () => clearTimeout(t);
  }, [user]);

  const firstName = user?.name?.split(" ")[0] || "";
  const marqueeItems = [...products, ...products];

  return (
    <div data-testid="home-page" className="page-fade">

      {/* Floating greeting toast */}
      {user && (
        <div style={{
          position: "fixed",
          top: "90px",
          left: "50%",
          transform: `translateX(-50%) translateY(${showGreeting ? "0" : "-20px"})`,
          opacity: showGreeting ? 1 : 0,
          transition: "opacity 0.6s ease, transform 0.6s ease",
          zIndex: 9999,
          pointerEvents: "none",
          background: "rgba(11,14,26,0.92)",
          border: "1px solid rgba(201,169,110,0.35)",
          backdropFilter: "blur(12px)",
          padding: "12px 28px",
          whiteSpace: "nowrap",
        }}>
          <span style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: "14px",
            letterSpacing: "0.08em",
            color: "#C9A96E",
          }}>
            Welcome back, {firstName} 🌙
          </span>
        </div>
      )}

      <Hero />

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

      {/* CHAPTERS SECTION */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3 reveal-up">Chapters</div>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-[#F5F0E8] max-w-3xl reveal-up" style={{ transitionDelay: "80ms" }}>
            Three lines. <span className="italic text-[#C9A96E]/90">One quiet wardrobe.</span>
          </h2>

          <div className="grid grid-cols-12 gap-6 md:gap-10 mt-16">
            <div className="col-span-12 md:col-span-7 reveal-up">
              <ChapterCard
                to="/shop?category=polo"
                imgSrc="https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/aimwehfu_beige%201.png"
                imgAlt="Textured Polo Tee"
                chapter="Chapter I"
                title="Textured Polo Tee"
                subtitle="Six tonal weaves · ₹399"
                aspectClass="aspect-[4/5]"
                delay={0}
              />
            </div>

            <div className="col-span-12 md:col-span-5 flex flex-col gap-10 md:pt-32">
              <div className="reveal-up" style={{ transitionDelay: "100ms" }}>
                <ChapterCard
                  to="/shop?category=designer"
                  imgSrc="https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/t9hvhdc6_designer%20green%201.png"
                  imgAlt="Prism Wear Tee"
                  chapter="Chapter II"
                  title="Prism Wear Tee"
                  subtitle="Ten designer prints · ₹349"
                  aspectClass="aspect-[4/5]"
                  delay={200}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 md:col-start-4 reveal-up" style={{ transitionDelay: "200ms" }}>
              <ChapterCard
                to="/shop?category=basics"
                imgSrc="https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/dp4xzzoz_plain%20black%201%20.png"
                imgAlt="Essential Tee"
                chapter="Chapter III"
                title="Essential Tee"
                subtitle="Black & white · ₹299"
                aspectClass="aspect-[5/4]"
                delay={400}
              />
            </div>
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
              {expandForCatalog(featured).slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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
