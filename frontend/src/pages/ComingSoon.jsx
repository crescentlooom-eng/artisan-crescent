import React from "react";

export default function ComingSoon() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0B0E1A",
        color: "#F5F0E8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: "#C9A96E",
          marginBottom: "16px",
          letterSpacing: "0.02em",
        }}
      >
        Crescent Loom
      </div>

      <p
        style={{
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          color: "#8A8FA8",
          maxWidth: "480px",
          lineHeight: 1.6,
          marginBottom: "8px",
        }}
      >
        We're weaving something new.
      </p>
      <p
        style={{
          fontSize: "0.95rem",
          color: "#8A8FA8",
          maxWidth: "480px",
          lineHeight: 1.6,
          marginBottom: "40px",
        }}
      >
        Crafted in Silence. Worn with Intention. Back soon.
      </p>

      <a
        href="https://wa.me/919810924300"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          border: "1px solid #C9A96E",
          color: "#C9A96E",
          padding: "12px 28px",
          borderRadius: "2px",
          fontSize: "0.85rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        Message us on WhatsApp
      </a>
    </div>
  );
}
