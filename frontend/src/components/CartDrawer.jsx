import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

export default function CartDrawer() {
  const { open, setOpen, items, removeItem, updateQty, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="cart-drawer">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md border-l flex flex-col" style={{ background: "var(--cl-bg)", borderColor: "rgba(184,192,200,0.15)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(184,192,200,0.1)" }}>
          <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-text)" }}>Your Atelier Bag</div>
          <button data-testid="cart-drawer-close" onClick={() => setOpen(false)} style={{ color: "var(--cl-text)", opacity: 0.8 }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="font-serif-display text-3xl mb-3" style={{ color: "var(--cl-text)" }}>A quiet bag.</div>
              <p className="text-sm mb-8" style={{ color: "var(--cl-subtext)" }}>Nothing rests here yet.</p>
              <Link to="/shop" onClick={() => setOpen(false)} className="btn-gold inline-block" data-testid="cart-drawer-shop-cta">
                Discover the collection
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.key} className="flex gap-4" data-testid={`cart-item-${it.slug}`}>
                <div className="w-24 h-32 overflow-hidden flex-shrink-0" style={{ background: "var(--cl-surface)" }}>
                  {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <Link to={`/product/${it.slug}`} onClick={() => setOpen(false)} className="font-serif-display text-lg leading-tight" style={{ color: "var(--cl-text)" }}>
                      {it.name}
                    </Link>
                    <button onClick={() => removeItem(it.key)} data-testid={`cart-item-remove-${it.slug}`} style={{ color: "var(--cl-subtext)" }}>
                      <X size={14} />
                    </button>
                  </div>
                  {it.size && <div className="text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: "var(--cl-subtext)" }}>Size · {it.size}</div>}
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center border" style={{ borderColor: "rgba(184,192,200,0.3)" }}>
                      <button onClick={() => updateQty(it.key, it.quantity - 1)} className="px-2 py-1" style={{ color: "var(--cl-text)", opacity: 0.8 }}><Minus size={12} /></button>
                      <span className="px-3 text-sm" style={{ color: "var(--cl-text)" }}>{it.quantity}</span>
                      <button onClick={() => updateQty(it.key, it.quantity + 1)} className="px-2 py-1" style={{ color: "var(--cl-text)", opacity: 0.8 }}><Plus size={12} /></button>
                    </div>
                    <div className="text-sm" style={{ color: "var(--cl-text)" }}>{formatINR(it.price * it.quantity)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-6 py-6 space-y-4" style={{ borderColor: "rgba(184,192,200,0.1)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Subtotal</span>
              <span className="text-lg" style={{ color: "var(--cl-text)" }} data-testid="cart-drawer-subtotal">{formatINR(subtotal)}</span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--cl-subtext)" }}>Shipping and taxes are calculated at checkout.</p>
            <button
              data-testid="cart-drawer-checkout"
              onClick={() => { setOpen(false); navigate("/checkout"); }}
              className="btn-gold w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
