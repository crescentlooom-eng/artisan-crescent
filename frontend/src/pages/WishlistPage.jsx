import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Heart, ShoppingBag, Share2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatINR, productImage } from "@/lib/api";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { user, loading } = useAuth();
  const { addItem } = useCart();

  if (loading) return <div className="pt-40 text-center tracking-[0.3em] uppercase text-sm" style={{ color: "var(--cl-subtext)" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const moveAllToBag = () => {
    items.forEach((p) => addItem(p));
    toast.success(`${items.length} piece${items.length !== 1 ? "s" : ""} added to your bag`);
  };

  const shareWishlist = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "My Crescent Loom Wishlist", url }); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div data-testid="wishlist-page" className="page-fade pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-[0.4em] uppercase mb-4" style={{ color: "#B8C0C8" }}>Saved Pieces</div>
          <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>
            Your <span className="italic" style={{ color: "#B8C0C8" }}>Quiet Library</span>
          </h1>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button onClick={shareWishlist} className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase border px-4 py-2.5" style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}>
              <Share2 size={13} /> Share
            </button>
            <button onClick={moveAllToBag} className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase px-4 py-2.5" style={{ background: "#B8C0C8", color: "#0B0E1A" }}>
              <ShoppingBag size={13} /> Move all to bag
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-24 text-center">
          <p style={{ color: "var(--cl-subtext)" }}>Nothing here yet — but the loom is patient.</p>
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
                  <div className="font-serif-display text-xl" style={{ color: "var(--cl-text)" }}>{p.name}</div>
                  <div className="text-sm mt-1" style={{ color: "var(--cl-text)", opacity: 0.7 }}>{formatINR(p.price)}</div>
                </div>
                <button onClick={() => toggle(p)} data-testid={`wishlist-remove-${p.slug}`} style={{ color: "#B8C0C8" }}>
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
              <button
                onClick={() => addItem(p)}
                data-testid={`wishlist-add-cart-${p.slug}`}
                className="mt-4 w-full text-[11px] tracking-[0.3em] uppercase border py-3 transition-colors flex items-center justify-center gap-2"
                style={{ borderColor: "rgba(184,192,200,0.4)", color: "#B8C0C8" }}
              >
                <ShoppingBag size={14} /> Add to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
