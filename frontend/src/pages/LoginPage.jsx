import React from "react";
import { useAuth } from "@/context/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function LoginPage() {
  const { user } = useAuth();

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/account";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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
    <div data-testid="login-page" className="page-fade min-h-[80vh] flex items-center justify-center pt-32 pb-20 px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">The House</div>
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">
          Welcome to <span className="italic text-[#C9A96E]/90">Crescent Loom.</span>
        </h1>
        <p className="text-[#F5F0E8]/75 mt-6">Sign in to follow pieces you love, save your bag, and view your orders.</p>

        <button
          data-testid="login-google-button"
          onClick={handleGoogle}
          className="mt-12 w-full bg-[#F5F0E8] text-[#0B0E1A] py-4 px-6 flex items-center justify-center gap-3 hover:bg-[#F5F0E8]/90 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          <span className="text-[12px] tracking-[0.3em] uppercase font-medium">Continue with Google</span>
        </button>

        <p className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-8">
          By signing in you agree to our quiet terms of service.
        </p>
      </div>
    </div>
  );
}
