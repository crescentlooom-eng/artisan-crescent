import ScrollToTop from "@/components/ScrollToTop";
import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "@/context/AuthContext";
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

import AdminShell from "@/pages/admin/AdminShell";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminLoomCreditsPage from "@/pages/admin/AdminLoomCreditsPage";

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
  // Handle OAuth callback session_id before normal routing
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
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
        <Route path="/returns" element={<StorefrontLayout><ReturnPolicyPage /></StorefrontLayout>} />
        <Route path="/shipping" element={<StorefrontLayout><ShippingPage /></StorefrontLayout>} />
      <Route path="*" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
    </Routes>
  );
}

function App() {
  const [splash, setSplash] = React.useState(true);
  return (
    <div className="App">
    {splash && <SplashScreen onComplete={() => setSplash(false)} />}
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ScrollToTop />
              <AppRouter />
                <Toaster theme="dark" position="top-center" toastOptions={{ style: { background: "#0B0E1A", color: "#F5F0E8", border: "1px solid rgba(201,169,110,0.2)" } }} />
              </WishlistProvider>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
