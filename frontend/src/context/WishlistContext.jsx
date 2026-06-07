import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WishCtx = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // array of product objects

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const r = await api.get("/wishlist");
      setItems(r.data);
    } catch {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const has = (productId) => items.some((p) => p.id === productId);

  const toggle = async (product) => {
    if (!user) return { needsAuth: true };
    if (has(product.id)) {
      await api.delete(`/wishlist/${product.id}`);
    } else {
      await api.post(`/wishlist/${product.id}`);
    }
    await refresh();
    return { needsAuth: false };
  };

  return <WishCtx.Provider value={{ items, has, toggle, refresh }}>{children}</WishCtx.Provider>;
};

export const useWishlist = () => useContext(WishCtx);
