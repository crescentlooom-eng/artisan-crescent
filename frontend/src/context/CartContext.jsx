import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { productImage } from "@/lib/api";

const CartCtx = createContext(null);
const STORAGE_KEY = "cl_cart_v1";

const PRISM_FREE_THRESHOLD = 5;
const PRISM_FREE_COUNT = 2;
const PRISM_UNLOCK_NOTICE_QTY = 3;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [showPrismModal, setShowPrismModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const getPrismQty = (list) =>
    list.filter((x) => x.category === "designer").reduce((s, x) => s + x.quantity, 0);

  const addItem = (product, { size = null, quantity = 1 } = {}) => {
    const prevPrismQty = getPrismQty(items);

    setItems((prev) => {
      const key = product.id + "::" + (size || "");
      const idx = prev.findIndex((x) => x.key === key);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      } else {
        next = [
          ...prev,
          {
            key,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.salePrice || product.price,
            category: product.category,
            image: product.images?.[0] || productImage(product) || "",
            size,
            quantity,
          },
        ];
      }
      const newPrismQty = getPrismQty(next);
      if (
        product.category === "designer" &&
        prevPrismQty < PRISM_UNLOCK_NOTICE_QTY &&
        newPrismQty >= PRISM_UNLOCK_NOTICE_QTY
      ) {
        setShowPrismModal(true);
      }
      return next;
    });
    setOpen(true);
  };

  const removeItem = (key) => setItems((prev) => prev.filter((x) => x.key !== key));
  const updateQty = (key, qty) =>
    setItems((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: Math.max(1, qty) } : x)));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => {
    return items.reduce((s, i) => {
      let payableQty = i.quantity;
      if (i.category === "designer" && i.quantity >= PRISM_FREE_THRESHOLD) {
        payableQty = i.quantity - PRISM_FREE_COUNT;
      }
      return s + i.price * payableQty;
    }, 0);
  }, [items]);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, updateQty, clear, subtotal, count, open, setOpen }}>
      {children}
      {showPrismModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowPrismModal(false)}
        >
          <div
            className="max-w-sm w-full text-center p-8 rounded-2xl border"
            style={{ background: "var(--cl-bg)", borderColor: "var(--cl-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: "#B8C0C8" }}>
              Rakhi Offer Unlocked
            </div>
            <h3 className="font-serif-display text-2xl mb-3" style={{ color: "var(--cl-text)" }}>
              2 Free Prism Wear Tees!
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--cl-subtext)" }}>
              Add 2 more Prism Wear designs to your bag and get them absolutely free — buy 3, get 5.
            </p>
            <button onClick={() => setShowPrismModal(false)} className="btn-gold w-full">
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
