import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { formatINR, productImage } from "@/lib/api";
export default function ProductCard({ product, index = 0 }) {
  const { has, toggle } = useWishlist();
  const wishlistKey = product.__isVariantCard ? product.id.split("__")[0] : product.id;
  const wishlistProduct = product.__isVariantCard ? { ...product, id: wishlistKey } : product;
  const isWished = has(wishlistKey);
  const img = productImage(product);
  const onWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = await toggle(wishlistProduct);
    if (r?.needsAuth) {
      window.location.href = "/login";
    }
  };
  return (
    <Link
      to={`/product/${product.slug}${product.variantId ? `?variant=${product.variantId}` : ""}`}
      data-testid={`product-card-${product.__isVariantCard ? `${product.slug}-${product.variantId}` : product.slug}`}
      className="group block reveal-up"
      style={{ transitionDelay: `${(index % 8) * 60}ms` }}
    >
      <div className="product-card-img-wrap product-card-halo aspect-[3/4] mb-5 relative">
        {img ? (
          <img src={img} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8A8FA8] text-xs tracking-[0.3em] uppercase">
            Awaiting Image
          </div>
        )}
        <button
          onClick={onWish}
          data-testid={`product-card-wishlist-${product.slug}${product.variantId ? `-${product.variantId}` : ""}`}
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
        {!product.__isVariantCard && product.variants?.length > 0 && (
          <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.25em] uppercase text-[#F5F0E8]/85 bg-[#0B0E1A]/60 backdrop-blur-md px-3 py-1">
            {product.variants.length} {product.variants.length === 1 ? "Variant" : "Variants"}
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <div className="font-serif-display text-lg md:text-xl text-[#F5F0E8] leading-tight truncate">{product.name}</div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{product.category}</div>
          {product.description && (
            <div className="text-[12px] text-[#8A8FA8]/80 mt-2 leading-relaxed line-clamp-2">{product.description}</div>
          )}
        </div>
        <div className="text-sm text-[#F5F0E8]/85 whitespace-nowrap pt-1">{formatINR(product.price)}</div>
      </div>
    </Link>
  );
}
