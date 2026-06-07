import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AdminAuthCtx = createContext({ admin: null, loading: true, login: async () => {}, logout: async () => {}, refresh: async () => {} });

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await api.get("/admin-auth/me");
      setAdmin(r.data);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const r = await api.post("/admin-auth/login", { email, password });
    setAdmin(r.data);
    return r.data;
  };

  const logout = async () => {
    try { await api.post("/admin-auth/logout"); } catch (_e) { /* noop */ }
    setAdmin(null);
  };

  return <AdminAuthCtx.Provider value={{ admin, loading, login, logout, refresh }}>{children}</AdminAuthCtx.Provider>;
};

export const useAdminAuth = () => useContext(AdminAuthCtx);
