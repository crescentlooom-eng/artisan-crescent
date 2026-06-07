import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { productImage } from "@/lib/api";

const CartCtx = createContext(null);
const STORAGE_KEY = "cl_cart_v1";

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, { size = null, quantity = 1 } = {}) => {
    setItems((prev) => {
      const key = product.id + "::" + (size || "");
      const idx = prev.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0] || productImage(product) || "",
          size,
          quantity,
        },
      ];
    });
    setOpen(true);
  };

  const removeItem = (key) => setItems((prev) => prev.filter((x) => x.key !== key));
  const updateQty = (key, qty) =>
    setItems((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: Math.max(1, qty) } : x)));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, updateQty, clear, subtotal, count, open, setOpen }}>
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
