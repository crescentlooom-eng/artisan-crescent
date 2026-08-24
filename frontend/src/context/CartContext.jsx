import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { productImage } from "@/lib/api";

const CartCtx = createContext(null);
const STORAGE_KEY = "cl_cart_v1";

const PRISM_UNLOCK_NOTICE_QTY = 3;
const PRISM_BUNDLE_MIN_QTY = 5;
const PRISM_COUPON_CODE = "RAKHI20";
const PRISM_COUPON_DISCOUNT = 396; // ₹1,745 (5 × ₹349) → ₹1,349

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
  const [couponCode, setCouponCode] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const getPrismQty = (list) =>
    list.filter((x) => x.category === "designer").reduce((s, x) => s + x.quantity, 0);

  useEffect(() => {
    if (couponCode && getPrismQty(items) < PRISM_BUNDLE_MIN_QTY) {
      setCouponCode(null);
    }
  }, [items, couponCode]);

  const addItem = (product, { size = null, quantity = 1, variantId = null } = {}) => {
    const prevPrismQty = getPrismQty(items);

    setItems((prev) => {
      const key = product.id + "::" + (variantId || "") + "::" + (size || "");
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
            variantId,
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
  const clear = () => { setItems([]); setCouponCode(null); };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const couponDiscount = useMemo(() => {
    if (couponCode === PRISM_COUPON_CODE && getPrismQty(items) >= PRISM_BUNDLE_MIN_QTY) {
      return PRISM_COUPON_DISCOUNT;
    }
    return 0;
  }, [couponCode, items]);

  const applyCoupon = (rawCode) => {
    const code = (rawCode || "").trim().toUpperCase();
    if (!code) return { success: false, message: "Enter a coupon code" };
    if (code !== PRISM_COUPON_CODE) return { success: false, message: "Invalid coupon code" };
    if (getPrismQty(items) < PRISM_BUNDLE_MIN_QTY) {
      return { success: false, message: `Add ${PRISM_BUNDLE_MIN_QTY} Prism Wear tees to your bag to use this code` };
    }
    setCouponCode(code);
    return { success: true, message: "Coupon applied!" };
  };

  const removeCoupon = () => setCouponCode(null);

  return (
    <CartCtx.Provider value={{
      items, addItem, removeItem, updateQty, clear, subtotal, count, open, setOpen,
      couponCode, couponDiscount, applyCoupon, removeCoupon,
    }}>
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
              5 Prism Wear Tees for ₹1,349!
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--cl-subtext)" }}>
              Add 2 more Prism Wear designs to unlock the bundle price, then apply this code at checkout.
            </p>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(PRISM_COUPON_CODE)}
              className="w-full flex items-center justify-between border px-4 py-3 mb-5"
              style={{ borderColor: "rgba(184,192,200,0.4)", color: "var(--cl-text)" }}
            >
              <span className="text-sm tracking-[0.2em] font-medium">{PRISM_COUPON_CODE}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#B8C0C8" }}>Tap to Copy</span>
            </button>
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
