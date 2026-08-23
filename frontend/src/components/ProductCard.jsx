import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import { formatINR, productImage } from "@/lib/api";

export default function ProductCard({ product, index = 0 }) {
  const { has, toggle } = useWishlist();
  const { theme } = useTheme();
  const isWished = has(product.id);
  const img = productImage(product, 0, theme);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const cardRef = useRef(null);
  const sweepRef = useRef(null);
  const [animated, setAnimated] = useState(false);
  const [swept, setSwept] = useState(false);

  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = await toggle(product);
    if (r?.needsAuth) window.location.href = "/login";
  };

  // Mobile only — IntersectionObserver for light sweep
  useEffect(() => {
    if (!isMobile || animated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setAnimated(true);
            // Sweep animation duration
            setTimeout(() => setSwept(true), 900);
          }, (index % 4) * 150);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobile, animated, index]);

  const cardNumber = String(index + 1).padStart(2, "0");

  return (
    <Link
      to={`/product/${product.slug}${product.variantId ? `?variant=${product.variantId}` : ""}`}
      data-testid={`product-card-${product.__isVariantCard ? `${product.slug}-${product.variantId}` : product.slug}`}
      className="group block reveal-up"
      style={{ transitionDelay: `${(index % 8) * 60}ms` }}
      ref={cardRef}
    >
      {/* Image wrapper */}
      <div
        className="product-card-img-wrap product-card-halo aspect-[3/4] mb-5 relative overflow-hidden"
        style={isMobile ? {
          // Gold border — faint always, brighter after sweep
          boxShadow: swept
            ? "0 0 0 1px rgba(184,192,200,0.35), inset 0 0 20px rgba(184,192,200,0.06)"
            : animated
            ? "0 0 0 1px rgba(184,192,200,0.35), inset 0 0 20px rgba(184,192,200,0.06)"
            : "0 0 0 1px rgba(184,192,200,0.08)",
          transition: "box-shadow 0.6s ease",
        } : {}}
      >

        {/* Product image */}
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
            style={isMobile ? {
              opacity: animated ? 1 : 0.4,
              transition: "opacity 0.6s ease",
            } : {}}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8A8FA8] text-xs tracking-[0.3em] uppercase">
            Awaiting Image
          </div>
        )}

        {/* Gold light sweep — mobile only */}
        {isMobile && animated && !swept && (
          <div
            ref={sweepRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: "linear-gradient(105deg, transparent 30%, rgba(184,192,200,0.45) 50%, rgba(245,240,232,0.25) 52%, transparent 70%)",
              animation: "goldSweep 0.85s ease forwards",
            }}
          />
        )}

                {/* Wishlist button */}
        <button
          onClick={onWish}
          data-testid={`product-card-wishlist-${product.slug}${product.variantId ? `-${product.variantId}` : ""}`}
          aria-label="Wishlist"
          className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-30 bg-[#0B0E1A]/40 hover:bg-[#0B0E1A]/70"
        >
          <Heart size={15} color={isWished ? "#E5484D" : "#F5F0E8"} fill={isWished ? "#E5484D" : "none"} />
        </button>
        {/* New badge */}
        {product.new_arrival && (
          <div className="absolute top-4 left-4 text-[10px] tracking-[0.25em] uppercase text-[#B8C0C8] bg-[#0B0E1A]/60 backdrop-blur-md px-3 py-1 z-30">
            New
          </div>
        )}

        {/* Variants badge */}
        {!product.__isVariantCard && product.variants?.length > 0 && (
          <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.25em] uppercase text-[#F5F0E8]/85 bg-[#0B0E1A]/60 backdrop-blur-md px-3 py-1 z-30">
            {product.variants.length} {product.variants.length === 1 ? "Variant" : "Variants"}
          </div>
        )}
      </div>

      {/* Card text */}
      <div
        className="flex items-start justify-between gap-3 px-1"
        style={isMobile ? {
          opacity: animated ? 1 : 0,
          transform: animated ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
        } : {}}
      >
        <div className="min-w-0 flex-1">
          <div className="font-serif-display text-lg md:text-xl leading-tight truncate" style={{ color: "var(--cl-text)" }}>{product.name}</div>
          <div className="text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: "var(--cl-subtext)" }}>{product.category}</div>
          {product.description && (
            <div className="text-[12px] text-[#8A8FA8]/80 mt-2 leading-relaxed line-clamp-2">{product.description}</div>
          )}
        </div>
        <div className="text-sm whitespace-nowrap pt-1" style={{ color: "var(--cl-text)" }}>{formatINR(product.price)}</div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes goldSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </Link>
  );
}
