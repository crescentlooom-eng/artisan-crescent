import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Loader2, Mail, Lock, User } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function LoginPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/account";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const formatError = (detail) => {
    if (!detail) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" · ");
    return String(detail);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const path = mode === "register" ? "/auth/register" : "/auth/login";
      const body = mode === "register" ? { email: email.trim(), password, name: name.trim() } : { email: email.trim(), password };
      const r = await api.post(path, body);
      setUser(r.data);
      navigate("/account", { replace: true });
    } catch (e) {
      setErr(formatError(e?.response?.data?.detail) || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="pt-40 max-w-md mx-auto px-6 text-center page-fade">
        <h1 className="font-serif-display text-4xl text-[#F5F0E8]">Welcome back, {user.name.split(" ")[0]}.</h1>
        <p className="text-[#8A8FA8] mt-3">You are signed in.</p>
        <a href="/account" className="btn-gold inline-block mt-8" data-testid="login-already-go-account">Go to your account</a>
      </div>
    );
  }

  return (
    <div data-testid="login-page" className="page-fade min-h-[88vh] flex items-center justify-center pt-32 pb-20 px-6">
      <div className="max-w-md w-full">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4 text-center">The House</div>
        <h1 className="font-serif-display text-4xl md:text-5xl text-[#F5F0E8] leading-[1.05] text-center">
          Welcome to <span className="italic text-[#C9A96E]/90">Crescent Loom.</span>
        </h1>
        <p className="text-[#F5F0E8]/75 mt-5 text-center text-sm">Sign in to follow pieces, save your bag, and view your orders.</p>

        {/* Google */}
        <button
          data-testid="login-google-button"
          onClick={handleGoogle}
          className="mt-10 w-full bg-[#F5F0E8] text-[#0B0E1A] py-4 px-6 flex items-center justify-center gap-3 hover:bg-[#F5F0E8]/90 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          <span className="text-[12px] tracking-[0.3em] uppercase font-medium">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-[#C9A96E]/20" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#8A8FA8]">or with email</span>
          <div className="flex-1 h-px bg-[#C9A96E]/20" />
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 mb-6 border border-[#C9A96E]/20">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(null); }}
              data-testid={`login-tab-${m}`}
              className={`text-[11px] tracking-[0.3em] uppercase py-3 transition-all ${
                mode === m ? "bg-[#C9A96E] text-[#0B0E1A]" : "text-[#F5F0E8]/80 hover:text-[#C9A96E]"
              }`}
            >{m === "login" ? "Sign In" : "Create Account"}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8] flex items-center gap-2"><User size={12}/> Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="login-name-input"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8] flex items-center gap-2"><Mail size={12}/> Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email-input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8] flex items-center gap-2"><Lock size={12}/> Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : undefined}
              data-testid="login-password-input"
              placeholder={mode === "register" ? "Min 8 characters" : "Your password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>

          {err && (
            <div className="text-sm text-red-400 border border-red-400/40 px-4 py-3" data-testid="login-error">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="login-submit-button"
            className="btn-gold w-full disabled:opacity-50 flex items-center justify-center gap-2 !mt-6"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : null}
            {submitting
              ? (mode === "register" ? "Creating account..." : "Signing in...")
              : (mode === "register" ? "Create Account" : "Sign In")}
          </button>
        </form>

        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8FA8] mt-10 text-center">
          By signing in you agree to our quiet terms of service.
        </p>
      </div>
    </div>
  );
}
