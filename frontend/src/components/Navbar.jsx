import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const WORDMARK = "https://customer-assets.emergentagent.com/job_24c8e302-f443-4113-9597-93d7fedd037d/artifacts/u4a3crws_ChatGPT%20Image%20Jun%202%2C%202026%2C%2009_03_25%20PM.png";

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
    { to: "/shop", label: "Shop" },
    { to: "/shop?category=designer", label: "Catalogue" },
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        scrolled ? "py-3 backdrop-blur-xl border-b border-[var(--cl-border)]" : "py-6 bg-transparent"
      }`}
      style={scrolled ? { backgroundColor: "var(--cl-header-bg)" } : undefined}
    >
      <div className="max-w-none mx-auto px-6 md:px-10 grid grid-cols-3 items-center">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.25em] uppercase text-[var(--cl-text)]/85">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}-link`}
              className={({ isActive }) => `gold-underline ${isActive ? "active text-[#B8C0C8]" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button data-testid="nav-mobile-toggle" className="md:hidden justify-self-start text-[var(--cl-text)]" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu size={22} />
        </button>

        {/* Center logo */}
        <Link to="/" data-testid="nav-logo" className="justify-self-center">
          <img src={WORDMARK} alt="Crescent Loom" className={`transition-all duration-500 ${scrolled ? "h-7" : "h-10"} w-auto`} />
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-6 justify-self-end text-[var(--cl-text)]/90">
          <button
            data-testid="nav-theme-toggle"
            onClick={toggleTheme}
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
          <Link to={user ? "/account" : "/login"} data-testid="nav-account-link" className="hover:text-[#B8C0C8] transition-colors">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full object-cover" style={{ border: "1px solid rgba(184,192,200,0.4)" }} />
            ) : (
              <User size={21} />
            )}
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
            <span className="text-[11px] tracking-[0.3em] text-[#B8C0C8] uppercase">Menu</span>
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
