import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Truck, PackageCheck, ShieldCheck, Headphones, Heart, Star } from "lucide-react";
import { productImage, formatINR } from "@/lib/api";
import { listProducts } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

const CATEGORY_IMAGES = {
  polo: "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/aimwehfu_beige%201.png",
  designer: "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/t9hvhdc6_designer%20green%201.png",
  basics: "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/dp4xzzoz_plain%20black%201%20.png",
};

function TrendCard({ product, index }) {
  const { has, toggle } = useWishlist();
  const isWished = has(product.id);
  const img = productImage(product);

  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = await toggle(product);
    if (r?.needsAuth) window.location.href = "/login";
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-xl" style={{ background: "var(--cl-surface)" }}>
        {img ? (
          <img src={img} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs tracking-[0.2em] uppercase" style={{ color: "var(--cl-subtext)" }}>
            Awaiting Image
          </div>
        )}
        <button
          onClick={onWish}
          aria-label="Wishlist"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
            isWished ? "bg-[#C9A96E] text-[#0B0E1A]" : "text-[var(--cl-text)]"
          }`}
          style={!isWished ? { background: "var(--cl-header-bg)" } : undefined}
        >
          <Heart size={14} fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>{product.name}</p>
      <p className="text-sm mt-1" style={{ color: "var(--cl-subtext)" }}>{formatINR(product.price)}</p>
    </Link>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setTrending(listProducts({ new_arrival: true }).slice(0, 6));
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
  const heroImg = trending[0] ? productImage(trending[0]) : null;

  return (
    <div data-testid="home-page" className="page-fade pt-24" style={{ color: "var(--cl-text)" }}>

      {/* Floating greeting toast */}
      {user && (
        <div style={{
          position: "fixed", top: "90px", left: "50%",
          transform: `translateX(-50%) translateY(${showGreeting ? "0" : "-20px"})`,
          opacity: showGreeting ? 1 : 0,
          transition: "opacity 0.6s ease, transform 0.6s ease",
          zIndex: 9999, pointerEvents: "none",
          background: "var(--cl-header-bg)",
          border: "1px solid rgba(201,169,110,0.35)",
          backdropFilter: "blur(12px)",
          padding: "12px 28px", whiteSpace: "nowrap",
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px", letterSpacing: "0.08em", color: "#C9A96E" }}>
            Welcome back, {firstName} 🌙
          </span>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="px-6 md:px-12 pb-14 max-w-none mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs tracking-[0.35em] mb-6 uppercase font-medium" style={{ color: "#C9A96E" }}>Wear the New Standard</p>
          <h1 className="font-serif-display text-6xl md:text-7xl lg:text-8xl leading-[1.02] mb-7" style={{ fontWeight: 400 }}>
            Where Style Speaks,<br />Trends Resonate.
          </h1>
          <p className="text-base mb-10 max-w-md leading-relaxed" style={{ color: "var(--cl-subtext)" }}>
            Premium essentials for the new generation. Minimal. Clean. Confident.
          </p>
          <div className="flex items-center gap-6 mb-10">
            <Link to="/shop" className="flex items-center gap-2 text-base font-medium px-8 py-4 rounded-full tracking-wide" style={{ background: "var(--cl-text)", color: "var(--cl-bg)" }}>
              Explore Collection <ArrowRight size={17} />
            </Link>
            <button className="flex items-center gap-2 text-sm font-medium">
              <span className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "var(--cl-border)" }}>
                <Play size={12} fill="var(--cl-text)" stroke="none" />
              </span>
              Watch Lookbook
            </button>
          </div>
          <div className="flex items-center gap-10 text-base">
            {[["10K+", "Happy Customers"], ["4.8★", "Product Rating"], ["Pan India", "Free Shipping"]].map(([big, small], i) => (
              <React.Fragment key={big}>
                {i > 0 && <div className="w-px h-8" style={{ background: "var(--cl-border)" }} />}
                <div>
                  <p className="font-semibold">{big}</p>
                  <p className="text-xs" style={{ color: "var(--cl-subtext)" }}>{small}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="h-[420px] rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "var(--cl-surface)" }}>
          {heroImg ? (
            <img src={heroImg} alt="Hero product" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--cl-subtext)" }}>Hero Product Shot</span>
          )}
        </div>
      </section>

      {/* ================= FEATURE BAR ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 rounded-2xl border px-8 py-6" style={{ borderColor: "var(--cl-border)" }}>
          {[[Truck, "Free Shipping", "On all orders over ₹499"], [PackageCheck, "Easy Returns", "30-day return policy"], [ShieldCheck, "Secure Payment", "100% safe & encrypted"], [Headphones, "24/7 Support", "We're here for you"]].map(([Icon, title, sub]) => (
            <div className="flex items-center gap-3" key={title}>
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--cl-surface)" }}>
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs" style={{ color: "var(--cl-subtext)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-display text-2xl">Shop by category</h2>
          <Link to="/shop" className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border" style={{ borderColor: "var(--cl-border)" }}>
            Browse all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { title: "Textured Polos", sub: "The New Smart Casual", to: "/shop?category=polo", img: CATEGORY_IMAGES.polo },
            { title: "Prism Wear", sub: "Everyday Designer Tees", to: "/shop?category=designer", img: CATEGORY_IMAGES.designer },
            { title: "Essentials", sub: "Wear Your Vibe", to: "/shop?category=basics", img: CATEGORY_IMAGES.basics },
          ].map((c) => (
            <Link to={c.to} key={c.title} className="rounded-2xl overflow-hidden relative block h-72">
              <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
                <p className="text-white font-medium font-serif-display text-xl">{c.title}</p>
                <p className="text-white/70 text-xs">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= TRENDING NOW ================= */}
      {trending.length > 0 && (
        <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif-display text-2xl">Trending now</h2>
            <Link to="/shop" className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border" style={{ borderColor: "var(--cl-border)" }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {trending.map((p, i) => <TrendCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ================= PROMO BANNER ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
        <div className="rounded-2xl overflow-hidden relative h-64 flex items-center" style={{ background: "var(--cl-surface)" }}>
          {CATEGORY_IMAGES.designer && (
            <img src={CATEGORY_IMAGES.designer} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--cl-bg) 30%, transparent)" }} />
          <div className="relative z-10 px-10 flex items-center justify-between w-full">
            <div>
              <p className="text-[11px] tracking-[0.2em] mb-2 uppercase" style={{ color: "var(--cl-subtext)" }}>Limited Time Offer</p>
              <h3 className="font-serif-display text-3xl mb-2">Spring / Summer<br />Collection 2026</h3>
              <p className="text-sm mb-4" style={{ color: "var(--cl-subtext)" }}>Upgrade your wardrobe with timeless essentials.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full" style={{ background: "var(--cl-text)", color: "var(--cl-bg)" }}>
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 shrink-0" style={{ borderColor: "#C9A96E" }}>
              <span className="text-xs" style={{ color: "var(--cl-subtext)" }}>Up to</span>
              <span className="text-3xl font-serif-display">30%</span>
              <span className="text-xs" style={{ color: "var(--cl-subtext)" }}>OFF</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS (placeholder copy — swap for real reviews) ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
        <h2 className="font-serif-display text-2xl mb-5">What our customers say</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { quote: "The quality is unbelievable for the price. Fit is perfect and the fabric feels so premium.", name: "Rohan Malhotra" },
            { quote: "Crescent Loom has become my go-to brand for everyday style. Minimal, clean and classy.", name: "Aman Verma" },
            { quote: "Fast delivery, great packaging and the t-shirts are even better in person.", name: "Jay Mehta" },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border p-6" style={{ borderColor: "var(--cl-border)", background: "var(--cl-surface)" }}>
              <p className="text-2xl mb-3 font-serif-display" style={{ color: "#C9A96E" }}>&ldquo;</p>
              <p className="text-sm mb-5" style={{ color: "var(--cl-subtext)" }}>{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full" style={{ background: "var(--cl-border)" }} />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="#C9A96E" stroke="#C9A96E" />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INSTAGRAM ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-display text-2xl">Follow us on Instagram</h2>
          <a href="https://www.instagram.com/crescent_looom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border" style={{ borderColor: "var(--cl-border)" }}>
            Follow us <ArrowRight size={12} />
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {trending.slice(0, 6).map((p) => (
            <a href="https://www.instagram.com/crescent_looom" target="_blank" rel="noopener noreferrer" key={p.id} className="aspect-square rounded-lg overflow-hidden block" style={{ background: "var(--cl-surface)" }}>
              {productImage(p) && <img src={productImage(p)} alt="" className="w-full h-full object-cover" />}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
