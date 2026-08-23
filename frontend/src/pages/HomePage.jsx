import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Truck, PackageCheck, ShieldCheck, Headphones, Heart, Star } from "lucide-react";
import { productImage, formatINR, expandForCatalog } from "@/lib/api";
import { listProducts, PRODUCTS } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";

const CATEGORY_IMAGES = {
  polo: "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/aimwehfu_beige%201.png",
  designer: "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/t9hvhdc6_designer%20green%201.png",
  basics: "https://customer-assets.emergentagent.com/job_artisan-crescent/artifacts/dp4xzzoz_plain%20black%201%20.png",
};

function TrendCard({ product, index, theme }) {
  const { has, toggle } = useWishlist();
  const isWished = has(product.id);
  const img = productImage(product, 0, theme);

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
            isWished ? "bg-[#B8C0C8] text-[#0B0E1A]" : "text-[var(--cl-text)]"
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
  const { theme } = useTheme();
  const archScrollRef = React.useRef(null);
  const archCenterItemRef = React.useRef(null);

        useEffect(() => {
    const poloCards = expandForCatalog(PRODUCTS.filter((p) => p.category === "polo")).slice(0, 3);
    const prismCards = expandForCatalog(PRODUCTS.filter((p) => p.category === "designer")).slice(0, 2);
    const essentialCards = expandForCatalog(PRODUCTS.filter((p) => p.category === "basics")).slice(0, 1);
    setTrending([...poloCards, ...prismCards, ...essentialCards]);
  }, []);

  useEffect(() => {
    const container = archScrollRef.current;
    const item = archCenterItemRef.current;
    if (!container || !item) return;
    const containerWidth = container.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    container.scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;
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
  const heroImg = "/hero-polo.png";

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
          border: "1px solid rgba(184,192,200,0.35)",
          backdropFilter: "blur(12px)",
          padding: "12px 20px", maxWidth: "90vw", textAlign: "center",
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px", letterSpacing: "0.08em", color: "var(--cl-text)" }}>
            Welcome back, {firstName} 🌙
          </span>
        </div>
      )}

            {/* ================= HERO ================= */}
      <section className="px-6 md:px-12 pb-10 max-w-3xl mx-auto text-center">
        <span
          className="inline-block text-[11px] tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border mb-6"
          style={{ borderColor: "var(--cl-border)", color: "var(--cl-subtext)" }}
        >
          New Season Arrivals
        </span>
        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] mb-6" style={{ fontWeight: 400 }}>
          Where quiet speaks,<br />detail carries the room.
        </h1>
        <p className="text-base mb-9 max-w-lg mx-auto leading-relaxed" style={{ color: "var(--cl-subtext)" }}>
          Slow-made pieces cut from considered fabric — for those who'd rather be noticed for what they wear, not how loud it is.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-base font-medium px-8 py-4 rounded-full tracking-wide"
          style={{ background: "var(--cl-text)", color: "var(--cl-bg)" }}
        >
          Explore Collection <ArrowRight size={17} />
        </Link>
      </section>

            {/* ================= ARCH CAROUSEL ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14 relative">
        <div ref={archScrollRef} className="flex items-end justify-start md:justify-center gap-3 md:gap-4 overflow-x-auto" style={{ scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}>
          {[
            { img: theme === "light" ? "/ess-c1-light-1.png" : "/ess-c1-1.png", h: "h-64 md:h-72", to: "/shop?category=basics" },
            { img: theme === "light" ? "/prism-d3-light-1.png" : "/prism-d3-1.png", h: "h-72 md:h-80", to: "/shop?category=designer" },
            { img: theme === "light" ? "/coastal-blue-light-1.png" : "/coastal-blue-1.png", h: "h-80 md:h-96", to: "/shop?category=polo" },
            { img: theme === "light" ? "/prism-d4-light-1.png" : "/prism-d4-1.png", h: "h-72 md:h-80", to: "/shop?category=designer" },
            { img: theme === "light" ? "/ess-c2-light-1.png" : "/ess-c2-1.png", h: "h-64 md:h-72", to: "/shop?category=basics" },
          ].map((arch, i) => (
            <Link
              to={arch.to}
              key={i}
              ref={i === 2 ? archCenterItemRef : undefined}
              className={`shrink-0 w-32 md:w-44 ${arch.h} overflow-hidden block transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-105`}
              style={{
                borderRadius: "9999px 9999px 0 0",
                background: "var(--cl-surface)",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                transitionProperty: "transform, box-shadow",
                scrollSnapAlign: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 20px 30px -10px rgba(0,0,0,0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")}
            >
              <img src={arch.img} alt="" className="w-full h-full object-cover" />
            </Link>
          ))}
        </div>
      </section>
            {/* ================= FEATURE BAR ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 rounded-2xl border px-6 py-10 md:px-8 md:py-8" style={{ borderColor: "var(--cl-border)" }}>
          {[[Truck, "Free Shipping", "On all orders over ₹499"], [PackageCheck, "Easy Returns", "30-day return policy"], [ShieldCheck, "Secure Payment", "100% safe & encrypted"], [Headphones, "24/7 Support", "We're here for you"]].map(([Icon, title, sub]) => (
            <div className="flex flex-col items-center text-center gap-2.5" key={title}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--cl-surface)" }}>
                <Icon size={17} />
              </span>
              <div>
                <p className="text-sm font-medium leading-snug">{title}</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--cl-subtext)" }}>{sub}</p>
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
                        {trending.map((p, i) => <TrendCard key={p.id} product={p} index={i} theme={theme} />)}
          </div>
        </section>
      )}

      {/* ================= PROMO BANNER ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-14">
        <div className="rounded-2xl overflow-hidden relative min-h-[220px] md:h-64 flex items-center" style={{ background: "var(--cl-surface)" }}>
          {CATEGORY_IMAGES.designer && (
            <img src={CATEGORY_IMAGES.designer} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--cl-bg) 30%, transparent)" }} />
          <div className="relative z-10 px-6 md:px-10 py-8 md:py-0 flex items-center justify-between w-full">
            <div>
              <p className="text-[10px] md:text-[11px] tracking-[0.2em] mb-2 uppercase" style={{ color: "var(--cl-subtext)" }}>Limited Time Offer</p>
              <h3 className="font-serif-display text-2xl md:text-3xl mb-2 leading-tight">Spring / Summer<br />Collection 2026</h3>
              <p className="text-xs md:text-sm mb-4" style={{ color: "var(--cl-subtext)" }}>Upgrade your wardrobe with timeless essentials.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full" style={{ background: "var(--cl-text)", color: "var(--cl-bg)" }}>
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 shrink-0" style={{ borderColor: "#B8C0C8" }}>
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
              <p className="text-2xl mb-3 font-serif-display" style={{ color: "var(--cl-text)" }}>&ldquo;</p>
              <p className="text-sm mb-5" style={{ color: "var(--cl-subtext)" }}>{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full" style={{ background: "var(--cl-border)" }} />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="var(--cl-text)" stroke="var(--cl-text)" />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INSTAGRAM ================= */}
      <section className="px-6 md:px-12 max-w-none mx-auto pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-display text-2xl">Follow us on Instagram</h2>
          <a href="https://www.instagram.com/crescent_looom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border" style={{ borderColor: "var(--cl-border)" }}>
            Follow us <ArrowRight size={12} />
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-3xl">
                    {trending.slice(0, 6).map((p) => (
            <a href="https://www.instagram.com/crescent_looom" target="_blank" rel="noopener noreferrer" key={p.id} className="aspect-square rounded-lg overflow-hidden block" style={{ background: "var(--cl-surface)" }}>
              {productImage(p, 0, theme) && <img src={productImage(p, 0, theme)} alt="" className="w-full h-full object-cover" />}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
