import React, { useState } from "react";
import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { LayoutDashboard, ShoppingBag, Users, Sparkle, Package, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, testId: "adm-nav-dashboard" },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, testId: "adm-nav-orders" },
  { to: "/admin/customers", label: "Customers", icon: Users, testId: "adm-nav-customers" },
  { to: "/admin/loom-credits", label: "Loom Credits", icon: Sparkle, testId: "adm-nav-loom" },
  { to: "/admin/pieces", label: "Pieces", icon: Package, testId: "adm-nav-pieces" },
];

export default function AdminShell() {
  const { admin, loading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#8A8FA8] tracking-[0.3em] uppercase text-xs">Loading...</div>;
  }
  if (!admin) return <Navigate to="/admin/login" replace />;

  const onLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0E1A] flex flex-col md:flex-row" data-testid="admin-shell">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-[#C9A96E]/15 px-6 py-8 sticky top-0 h-screen">
        <Link to="/" className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E]">Crescent Loom</Link>
        <div className="font-serif-display text-2xl text-[#F5F0E8] mt-2 leading-tight">Atelier</div>
        <nav className="mt-12 flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={n.testId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-[12px] tracking-[0.2em] uppercase transition-all ${
                  isActive ? "bg-[#C9A96E]/10 text-[#C9A96E] border-l-2 border-[#C9A96E]" : "text-[#F5F0E8]/75 hover:text-[#C9A96E] border-l-2 border-transparent"
                }`
              }
            >
              <n.icon size={15} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-6 border-t border-[#C9A96E]/15">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#8A8FA8]">Signed in</div>
          <div className="text-sm text-[#F5F0E8] mt-1 truncate">{admin.email}</div>
          <button onClick={onLogout} data-testid="adm-logout" className="mt-4 text-[11px] tracking-[0.3em] uppercase text-[#F5F0E8]/80 hover:text-[#C9A96E] flex items-center gap-2">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0B0E1A]/90 backdrop-blur-md border-b border-[#C9A96E]/15 px-5 py-4 flex items-center justify-between">
        <Link to="/" className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]">Crescent Loom · Atelier</Link>
        <button onClick={() => setMobileOpen((v) => !v)} className="text-[#F5F0E8]" data-testid="adm-mobile-toggle">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {mobileOpen && (
        <div className="md:hidden border-b border-[#C9A96E]/15 bg-[#0B0E1A]">
          <nav className="px-3 py-3 grid grid-cols-2 gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 text-[11px] tracking-[0.2em] uppercase ${
                    isActive ? "bg-[#C9A96E]/10 text-[#C9A96E]" : "text-[#F5F0E8]/80"
                  }`
                }
              >
                <n.icon size={13} />
                {n.label}
              </NavLink>
            ))}
            <button onClick={onLogout} className="col-span-2 mt-2 px-3 py-3 text-[11px] tracking-[0.2em] uppercase text-[#F5F0E8]/80 flex items-center gap-2 border-t border-[#C9A96E]/15">
              <LogOut size={13} /> Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 px-5 md:px-10 py-8 md:py-12 max-w-[1500px] w-full">
        <Outlet />
      </main>
    </div>
  );
}
