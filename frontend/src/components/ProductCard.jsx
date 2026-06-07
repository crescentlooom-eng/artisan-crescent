import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { formatINR } from "@/lib/api";

export default function ProductCard({ product, index = 0 }) {
  const { has, toggle } = useWishlist();
  const isWished = has(product.id);

  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = await toggle(product);
    if (r?.needsAuth) {
      window.location.href = "/login";
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group block reveal-up"
      style={{ transitionDelay: `${(index % 8) * 60}ms` }}
    >
      <div className="product-card-img-wrap product-card-halo aspect-[3/4] mb-5 relative">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onWish}
          data-testid={`product-card-wishlist-${product.slug}`}
          aria-label="Wishlist"
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isWished ? "bg-[#C9A96E] text-[#0B0E1A]" : "bg-[#0B0E1A]/40 text-[#F5F0E8] hover:bg-[#0B0E1A]/70"
          }`}
        >
          <Heart size={15} fill={isWished ? "currentColor" : "none"} />
        </button>
        {product.new_arrival && (
          <div className="absolute top-4 left-4 text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] bg-[#0B0E1A]/60 backdrop-blur-md px-3 py-1">
            New
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <div className="font-serif-display text-xl md:text-2xl text-[#F5F0E8] leading-tight">{product.name}</div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{product.category}</div>
        </div>
        <div className="text-sm text-[#F5F0E8]/85 whitespace-nowrap pt-1">{formatINR(product.price)}</div>
      </div>
    </Link>
  );
}
