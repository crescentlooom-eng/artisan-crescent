import React, { useEffect, useState } from "react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_24c8e302-f443-4113-9597-93d7fedd037d/artifacts/5mob2a25_ChatGPT%20Image%20Jun%202%2C%202026%2C%2009_09_38%20PM.png";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // enter → shimmer → exit

  useEffect(() => {
    // Phase 1: logo fades in (0-800ms)
    // Phase 2: shimmer + text (800-2200ms)
    // Phase 3: fade out (2200-2800ms)
    const t1 = setTimeout(() => setPhase("shimmer"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#0B0E1A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Aura glow behind logo */}
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 70%)",
        transition: "transform 1.5s ease, opacity 1.5s ease",
        transform: phase === "shimmer" ? "scale(1.4)" : "scale(1)",
        opacity: phase === "shimmer" ? 1 : 0.4,
      }} />

      {/* Logo */}
      <div style={{
        transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.25,1,0.5,1)",
        opacity: phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "scale(0.85)" : "scale(1)",
        position: "relative",
        zIndex: 1,
      }}>
        <img
          src={LOGO_URL}
          alt="Crescent Loom"
          style={{ width: "120px", height: "120px", objectFit: "contain" }}
        />
      </div>

      {/* Brand name */}
      <div style={{
        marginTop: "24px",
        transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
        opacity: phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "translateY(12px)" : "translateY(0)",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Georgia, serif",
          fontWeight: 300,
          fontSize: "22px",
          letterSpacing: "0.2em",
          color: "#F5F0E8",
          textTransform: "uppercase",
        }}>
          Crescent Loom
        </div>
        <div style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: "11px",
          letterSpacing: "0.3em",
          color: "#C9A96E",
          marginTop: "6px",
          transition: "opacity 0.8s ease 0.6s",
          opacity: phase === "shimmer" ? 1 : 0,
        }}>
          Crafted in Silence.
        </div>
      </div>

      {/* Bottom line */}
      <div style={{
        position: "absolute",
        bottom: "48px",
        width: "40px",
        height: "1px",
        background: "rgba(201,169,110,0.4)",
        transition: "width 1s ease 0.5s",
      }} />
    </div>
  );
}
