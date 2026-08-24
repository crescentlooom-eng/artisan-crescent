import ScrollToTop from "@/components/ScrollToTop";
import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CursorDot from "@/components/CursorDot";
import PageTransition from "@/components/PageTransition";
import SplashScreen from "@/components/SplashScreen";

import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import AboutPage from "@/pages/AboutPage";
import LoginPage from "@/pages/LoginPage";
import AccountPage from "@/pages/AccountPage";
import WishlistPage from "@/pages/WishlistPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ThankYouPage from "@/pages/ThankYouPage";
import AdminPage from "@/pages/AdminPage";
import AuthCallback from "@/pages/AuthCallback";
import ReturnPolicyPage from "@/pages/ReturnPolicyPage";
import ShippingPage from "@/pages/ShippingPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ComingSoon from "@/pages/ComingSoon";

import AdminShell from "@/pages/admin/AdminShell";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminLoomCreditsPage from "@/pages/admin/AdminLoomCreditsPage";

// ---- Coming Soon Gate Config ----
const SITE_LOCKED = false; // flip to false to fully reopen the site to everyone
const BYPASS_KEY = "cl_preview_access";
const BYPASS_SECRET = "crescentloom2026"; // change this to whatever secret you want

function useIsUnlocked() {
  const location = useLocation();
  const [unlocked, setUnlocked] = React.useState(
    () => localStorage.getItem(BYPASS_KEY) === BYPASS_SECRET
  );

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preview = params.get("preview");
    if (preview === BYPASS_SECRET) {
      localStorage.setItem(BYPASS_KEY, BYPASS_SECRET);
      setUnlocked(true);
    }
  }, [location.search]);

  return unlocked;
}
function SaleCountdownBar() {
  const [timeLeft, setTimeLeft] = React.useState(null);

  React.useEffect(() => {
    const target = new Date("2026-08-30T23:59:00+05:30").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 text-[11px] sm:text-xs tracking-[0.15em] uppercase font-medium"
      style={{ background: "#B8860B", color: "#fff" }}
    >
      <span>Rakhi Sale Ends In</span>
      <span className="font-semibold">
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}
function StorefrontLayout({ children }) {
  return (
    <>
      <CursorDot />
      <Navbar />
      <main><PageTransition>{children}</PageTransition></main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function AppRouter() {
  const location = useLocation();
  const isUnlocked = useIsUnlocked();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Handle OAuth callback session_id before normal routing
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  // Gate: show Coming Soon for storefront visitors unless unlocked or on admin path
  if (SITE_LOCKED && !isUnlocked && !isAdminRoute) {
    return <ComingSoon />;
  }

  return (
    <Routes>
      {/* Admin (no storefront chrome) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="loom-credits" element={<AdminLoomCreditsPage />} />
        <Route path="pieces" element={<AdminPage />} />
      </Route>

      {/* Storefront */}
      <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
      <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
      <Route path="/product/:slug" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
      <Route path="/about" element={<StorefrontLayout><AboutPage /></StorefrontLayout>} />
      <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
      <Route path="/account" element={<StorefrontLayout><AccountPage /></StorefrontLayout>} />
      <Route path="/wishlist" element={<StorefrontLayout><WishlistPage /></StorefrontLayout>} />
      <Route path="/checkout" element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>} />
      <Route path="/thank-you" element={<StorefrontLayout><ThankYouPage /></StorefrontLayout>} />
                <Route path="/returns" element={<StorefrontLayout><ReturnPolicyPage /></StorefrontLayout>} />
        <Route path="/shipping" element={<StorefrontLayout><ShippingPage /></StorefrontLayout>} />
        <Route path="/terms" element={<StorefrontLayout><TermsPage /></StorefrontLayout>} />
        <Route path="/privacy-policy" element={<StorefrontLayout><PrivacyPage /></StorefrontLayout>} />
        <Route path="/shipping" element={<StorefrontLayout><ShippingPage /></StorefrontLayout>} />
      <Route path="*" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
    </Routes>
  );
}

function App() {
    const [splash, setSplash] = React.useState(
    () => !sessionStorage.getItem("cl_splash_seen")
  );
  const dismissSplash = () => {
    sessionStorage.setItem("cl_splash_seen", "1");
    setSplash(false);
  };
  return (
    <div className="App">
    {splash && <SplashScreen onComplete={dismissSplash} />}
      <BrowserRouter>
        <ThemeProvider>
        <div className="fabric-bg" />
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ScrollToTop />
              <AppRouter />
                <Toaster theme="dark" position="top-center" toastOptions={{ style: { background: "#0B0E1A", color: "#F5F0E8", border: "1px solid rgba(184,192,200,0.2)" } }} />
              </WishlistProvider>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
