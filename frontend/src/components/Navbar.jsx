import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const WORDMARK = "https://customer-assets.emergentagent.com/job_24c8e302-f443-4113-9597-93d7fedd037d/artifacts/u4a3crws_ChatGPT%20Image%20Jun%202%2C%202026%2C%2009_03_25%20PM.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const { count, setOpen: setCartOpen } = useCart();
  const { user } = useAuth();
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
        scrolled ? "py-3 backdrop-blur-xl bg-[#0B0E1A]/70 border-b border-[#C9A96E]/10" : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-3 items-center">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.25em] uppercase text-[#F5F0E8]/85">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}-link`}
              className={({ isActive }) => `gold-underline ${isActive ? "active text-[#C9A96E]" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button data-testid="nav-mobile-toggle" className="md:hidden justify-self-start text-[#F5F0E8]" onClick={() => setOpen(true)} aria-label="Menu">
          <Menu size={22} />
        </button>

        {/* Center logo */}
        <Link to="/" data-testid="nav-logo" className="justify-self-center">
          <img src={WORDMARK} alt="Crescent Loom" className={`transition-all duration-500 ${scrolled ? "h-7" : "h-10"} w-auto`} />
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-5 justify-self-end text-[#F5F0E8]/90">
          <button data-testid="nav-search-button" onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="hover:text-[#C9A96E] transition-colors">
            <Search size={18} />
          </button>
          <Link to="/wishlist" data-testid="nav-wishlist-link" className="hover:text-[#C9A96E] transition-colors hidden md:inline">
            <Heart size={18} />
          </Link>
          <Link to={user ? "/account" : "/login"} data-testid="nav-account-link" className="hover:text-[#C9A96E] transition-colors">
            <User size={18} />
          </Link>
          <button data-testid="nav-cart-button" onClick={() => setCartOpen(true)} aria-label="Cart" className="relative hover:text-[#C9A96E] transition-colors">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span data-testid="nav-cart-count" className="absolute -top-1.5 -right-2 text-[10px] bg-[#C9A96E] text-[#0B0E1A] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-medium">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search drawer */}
      {searchOpen && (
        <div className="border-t border-[#C9A96E]/10 bg-[#0B0E1A]/95 backdrop-blur-xl">
          <form onSubmit={submitSearch} className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
            <Search size={18} className="text-[#C9A96E]" />
            <input
              data-testid="nav-search-input"
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search the atelier — coats, linen, silk…"
              className="flex-1 text-base"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-[#8A8FA8]"><X size={18} /></button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-[#0B0E1A] z-50 page-fade">
          <div className="flex items-center justify-between px-6 py-6">
            <span className="text-[11px] tracking-[0.3em] text-[#C9A96E] uppercase">Menu</span>
            <button onClick={() => setOpen(false)} data-testid="nav-mobile-close" className="text-[#F5F0E8]"><X size={22} /></button>
          </div>
          <nav className="flex flex-col items-start gap-6 px-8 mt-6">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-serif-display text-4xl text-[#F5F0E8]">
                {l.label}
              </Link>
            ))}
            <Link to="/wishlist" onClick={() => setOpen(false)} className="font-serif-display text-4xl text-[#F5F0E8]">Wishlist</Link>
            <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="font-serif-display text-4xl text-[#F5F0E8]">
              {user ? "Account" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
