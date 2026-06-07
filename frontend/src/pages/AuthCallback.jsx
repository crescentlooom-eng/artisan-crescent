import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const session_id = params.get("session_id");
    if (!session_id) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const r = await api.post("/auth/session", { session_id });
        setUser(r.data);
        // Clear hash and go to account
        window.history.replaceState({}, "", "/account");
        navigate("/account", { replace: true, state: { user: r.data } });
      } catch (e) {
        console.error(e);
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-32 text-[#8A8FA8] tracking-[0.3em] uppercase text-xs" data-testid="auth-callback">
      Entering the atelier...
    </div>
  );
}
