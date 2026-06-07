import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatINR, productImage } from "@/lib/api";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { user, loading } = useAuth();
  const { addItem } = useCart();

  if (loading) return <div className="pt-40 text-center text-[#8A8FA8] tracking-[0.3em] uppercase text-sm">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div data-testid="wishlist-page" className="page-fade pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Saved Pieces</div>
      <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">Your <span className="italic text-[#C9A96E]/90">Quiet Library</span></h1>

      {items.length === 0 ? (
        <div className="mt-24 text-center">
          <p className="text-[#8A8FA8]">Nothing here yet — but the loom is patient.</p>
          <Link to="/shop" className="btn-gold inline-block mt-8">Enter the Collection</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14 mt-16">
          {items.map((p) => (
            <div key={p.id} className="group" data-testid={`wishlist-item-${p.slug}`}>
              <Link to={`/product/${p.slug}`}>
                <div className="product-card-img-wrap product-card-halo aspect-[3/4] mb-4">
                  <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-serif-display text-xl text-[#F5F0E8]">{p.name}</div>
                  <div className="text-sm text-[#F5F0E8]/70 mt-1">{formatINR(p.price)}</div>
                </div>
                <button onClick={() => toggle(p)} className="text-[#C9A96E] hover:text-[#F5F0E8]" data-testid={`wishlist-remove-${p.slug}`}>
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
              <button onClick={() => addItem(p)} className="mt-4 w-full text-[11px] tracking-[0.3em] uppercase border border-[#C9A96E]/40 text-[#C9A96E] py-3 hover:bg-[#C9A96E] hover:text-[#0B0E1A] transition-colors flex items-center justify-center gap-2" data-testid={`wishlist-add-cart-${p.slug}`}>
                <ShoppingBag size={14} /> Add to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
