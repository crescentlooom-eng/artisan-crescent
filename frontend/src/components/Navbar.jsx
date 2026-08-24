import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const { count, setOpen: setCartOpen } = useCart();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

    const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Catalogue" },
    { to: "/about", label: "Journal" },
  ];

  const submitSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  return (
                <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] bg-transparent ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
            <div className="max-w-none mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.25em] uppercase text-[var(--cl-text)]/85">
          {navLinks.map((l) => (
            <NavLink
            key={l.to}
            to={l.to}
            data-testid={`nav-${l.label.toLowerCase()}-link`}
            className={({ isActive }) => `gold-underline ${isActive ? "active" : ""}`}
            style={({ isActive }) => (isActive ? { color: "var(--cl-text)" } : undefined)}
            >
            {l.label}
            </NavLink>
          ))}
        </nav>
                <button data-testid="nav-mobile-toggle" className="md:hidden text-[var(--cl-text)] shrink-0" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu size={22} />
        </button>

                {/* Center logo */}
        <Link to="/" data-testid="nav-logo" className="absolute left-1/2 -translate-x-1/2">
  <img src={theme === "light" ? "/logo-black.png" : "/logo-white.png"} alt="Crescent Loom" className={`transition-all duration-500 ${scrolled ? "h-9" : "h-12"} w-auto`} />
</Link>

                {/* Right icons */}
                        <div
          className="flex items-center gap-3 sm:gap-5 md:gap-6 shrink-0 text-[var(--cl-text)] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md transition-all duration-300"
          style={{ background: "var(--cl-header-bg)" }}
        >
                    <button
            data-testid="nav-theme-toggle"
            onClick={(e) => toggleTheme(e)}
            aria-label="Toggle theme"
            className="hover:text-[#B8C0C8] transition-colors"
          >
            {theme === "dark" ? <Sun size={21} /> : <Moon size={21} />}
          </button>
          <button data-testid="nav-search-button" onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="hover:text-[#B8C0C8] transition-colors">
            <Search size={21} />
          </button>
                              <Link to="/wishlist" data-testid="nav-wishlist-link" className="hover:text-[#B8C0C8] transition-colors hidden md:inline">
            <Heart size={21} />
          </Link>
          <Link to={user ? "/account" : "/login"} data-testid="nav-account-link" className="hover:text-[#B8C0C8] transition-colors shrink-0">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
                style={{ border: "1px solid rgba(184,192,200,0.4)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }}
              />
            ) : null}
            <User size={21} style={{ display: user?.picture ? "none" : "block" }} />
          </Link>
          <button data-testid="nav-cart-button" onClick={() => setCartOpen(true)} aria-label="Cart" className="relative hover:text-[#B8C0C8] transition-colors">
            <ShoppingBag size={21} />
            {count > 0 && (
              <span data-testid="nav-cart-count" className="absolute -top-1.5 -right-2 text-[10px] bg-[#B8C0C8] text-[#0B0E1A] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-medium">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search drawer */}
      {searchOpen && (
        <div className="border-t border-[var(--cl-border)]" style={{ backgroundColor: "var(--cl-header-bg)" }}>
          <form onSubmit={submitSearch} className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
            <Search size={21} className="text-[#B8C0C8]" />
            <input
              data-testid="nav-search-input"
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search the atelier — coats, linen, silk…"
              className="flex-1 text-base"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-[var(--cl-subtext)]"><X size={21} /></button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 page-fade" style={{ backgroundColor: "var(--cl-bg)" }}>
          <div className="flex items-center justify-between px-6 py-6">
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-text)" }}>Menu</span>
            <button onClick={() => setOpen(false)} data-testid="nav-mobile-close" className="text-[var(--cl-text)]"><X size={22} /></button>
          </div>
          <nav className="flex flex-col items-start gap-6 px-8 mt-6">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-serif-display text-4xl text-[var(--cl-text)]">
                {l.label}
              </Link>
            ))}
            <Link to="/wishlist" onClick={() => setOpen(false)} className="font-serif-display text-4xl text-[var(--cl-text)]">Wishlist</Link>
            <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="font-serif-display text-4xl text-[var(--cl-text)]">
              {user ? "Account" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
