import React, { useEffect, useState } from "react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_24c8e302-f443-4113-9597-93d7fedd037d/artifacts/5mob2a25_ChatGPT%20Image%20Jun%202%2C%202026%2C%2009_09_38%20PM.png";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // enter → shimmer → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("shimmer"), 1000);
    const t2 = setTimeout(() => setPhase("exit"), 3200);
    const t3 = setTimeout(() => onComplete(), 3900);
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
        transition: "opacity 0.7s ease",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Aura glow */}
      <div style={{
        position: "absolute",
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)",
        transition: "transform 2s ease, opacity 2s ease",
        transform: phase === "shimmer" ? "scale(1.5)" : "scale(1)",
        opacity: phase === "shimmer" ? 1 : 0.3,
      }} />

      {/* Logo */}
      <div style={{
        transition: "opacity 1s ease, transform 1s cubic-bezier(0.25,1,0.5,1)",
        opacity: phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "scale(0.8)" : "scale(1)",
        position: "relative",
        zIndex: 1,
      }}>
        <img
          src={LOGO_URL}
          alt="Crescent Loom"
          style={{ width: "110px", height: "110px", objectFit: "contain" }}
        />
      </div>

      {/* Quote */}
      <div style={{
        marginTop: "32px",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "0 40px",
        transition: "opacity 1s ease 0.5s, transform 1s ease 0.5s",
        opacity: phase === "enter" ? 0 : 1,
        transform: phase === "enter" ? "translateY(16px)" : "translateY(0)",
      }}>
       <div style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "16px",
          color: "rgba(245,240,232,0.8)",
          lineHeight: "1.7",
          letterSpacing: "0.03em",
        }}>
          &ldquo;Clothing that feels like coming home.&rdquo;
        </div>

        {/* Gold line */}
        <div style={{
          margin: "20px auto 0",
          height: "1px",
          background: "rgba(201,169,110,0.5)",
          transition: "width 1.2s ease 0.8s",
          width: phase === "shimmer" ? "60px" : "0px",
        }} />

        {/* Tagline */}
        <div style={{
          marginTop: "16px",
          fontFamily: "Georgia, serif",
          fontSize: "10px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#C9A96E",
          transition: "opacity 1s ease 1s",
          opacity: phase === "shimmer" ? 1 : 0,
        }}>
          Crescent Loom
        </div>
      </div>
    </div>
  );
}
