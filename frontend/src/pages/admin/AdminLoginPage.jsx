import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const { admin, login, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center pt-32 text-[#8A8FA8] tracking-[0.3em] uppercase text-xs">Loading...</div>;
  }
  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (e) {
      const d = e?.response?.data?.detail;
      setErr(typeof d === "string" ? d : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="page-fade min-h-[88vh] flex items-center justify-center px-6 pt-28">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full border border-[#C9A96E]/40 flex items-center justify-center">
            <Lock size={18} className="text-[#C9A96E]" />
          </div>
        </div>
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3 text-center">Atelier</div>
        <h1 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] leading-[1.05] text-center">
          Private <span className="italic text-[#C9A96E]/90">Admin</span>
        </h1>
        <p className="text-center text-[#8A8FA8] text-sm mt-4">Sign in to manage orders, customers, and the loom.</p>

        <form onSubmit={submit} className="mt-12 space-y-6">
          <div>
            <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="admin-login-email"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="admin-login-password"
            />
          </div>
          {err && (
            <div className="text-sm text-red-400 border border-red-400/40 px-4 py-3" data-testid="admin-login-error">
              {err}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50 flex items-center justify-center gap-2" data-testid="admin-login-submit">
            {submitting ? <Loader2 className="animate-spin" size={14} /> : null}
            {submitting ? "Authenticating..." : "Enter Atelier"}
          </button>
        </form>

        <p className="text-[11px] tracking-[0.25em] uppercase text-[#8A8FA8] mt-12 text-center">
          Restricted. The atelier door is locked.
        </p>
      </div>
    </div>
  );
}
