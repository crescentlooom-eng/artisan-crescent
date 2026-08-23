import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("cl_theme") || "dark";
  });
  const [transitioning, setTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState({ x: "50%", y: "50%" });
  const toggleBtnRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("cl_theme", theme);
  }, [theme]);

  const toggleTheme = (originEvent) => {
    const hasSeenTransition = localStorage.getItem("cl_theme_transition_seen");

    if (!hasSeenTransition && originEvent?.currentTarget) {
      const rect = originEvent.currentTarget.getBoundingClientRect();
      setTransitionOrigin({
        x: `${rect.left + rect.width / 2}px`,
        y: `${rect.top + rect.height / 2}px`,
      });
      setTransitioning(true);
      localStorage.setItem("cl_theme_transition_seen", "1");

      setTimeout(() => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
      }, 350);

      setTimeout(() => {
        setTransitioning(false);
      }, 1100);
    } else {
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
      {transitioning && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: transitionOrigin.x,
              top: transitionOrigin.y,
              width: "40px",
              height: "40px",
              marginLeft: "-20px",
              marginTop: "-20px",
              borderRadius: "50%",
              background: theme === "dark" ? "#F5F0E8" : "#0B0E1A",
              animation: "cl-theme-reveal 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              animationDelay: "0.25s",
            }}
          />
          <style>{`
            @keyframes cl-theme-reveal {
              0% { transform: scale(0); opacity: 0.9; }
              60% { opacity: 0.5; }
              100% { transform: scale(60); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
