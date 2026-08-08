import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LayoutGrid, Package, Heart, MapPin, User as UserIcon, Lock, LogOut, ArrowRight } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import LoomCreditsCard from "@/components/LoomCreditsCard";

const TIMELINE_STEPS = ["Confirmed", "Packed", "Dispatched", "Out for Delivery", "Delivered"];

function getStepIndex(status) {
  if (status === "delivered") return 4;
  if (status === "out_for_delivery") return 3;
  if (status === "shipped") return 2;
  if (status === "packed") return 1;
  return 0;
}

function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return <div className="text-[11px] tracking-[0.3em] uppercase mt-4" style={{ color: "var(--cl-subtext)" }}>Order Cancelled</div>;
  }
  const activeIndex = getStepIndex(status);
  return (
    <div className="mt-5">
      {TIMELINE_STEPS.map((label, i) => {
        const isDone = i <= activeIndex;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={isDone ? { background: "#C9A96E" } : { background: "transparent", border: "1px solid var(--cl-subtext)" }} />
              {!isLast && <div className="w-px flex-1 min-h-[22px]" style={{ background: isDone && i < activeIndex ? "#C9A96E" : "var(--cl-border)" }} />}
            </div>
            <div className="pb-5 text-[13px]" style={{ color: isDone ? "var(--cl-text)" : "var(--cl-subtext)" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const label = status === "out_for_delivery" ? "Out for Delivery" : status.charAt(0).toUpperCase() + status.slice(1);
  const color = status === "delivered" ? "#8FBC8F" : status === "cancelled" ? "#E57373" : "#C9A96E";
  return <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color }}>{label}</span>;
}

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "orders", label: "Orders", icon: Package },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "details", label: "Account Details", icon: UserIcon },
  { key: "password", label: "Password", icon: Lock },
];

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loom, setLoom] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (user) {
      api.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
      api.get("/loom-credits/me").then((r) => setLoom(r.data)).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return <div className="pt-40 text-center tracking-[0.3em] uppercase text-sm" style={{ color: "var(--cl-subtext)" }}>Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const firstName = user.name.split(" ")[0];
  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div data-testid="account-page" className="page-fade pt-28 md:pt-32 pb-24 max-w-none mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase mb-3" style={{ color: "#C9A96E" }}>Your House</div>
      <h1 className="font-serif-display text-4xl md:text-5xl mb-1" style={{ color: "var(--cl-text)" }}>My Account</h1>
      <div className="text-xs mt-2" style={{ color: "var(--cl-subtext)" }}>Home / My Account</div>

      <div className="flex flex-col md:flex-row gap-10 mt-10">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className="flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap text-left transition-colors"
                  style={active ? { background: "var(--cl-surface)", color: "#C9A96E", borderLeft: "2px solid #C9A96E" } : { color: "var(--cl-text)", opacity: 0.75, borderLeft: "2px solid transparent" }}
                >
                  <Icon size={15} /> {item.label}
                </button>
              );
            })}
            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap transition-colors" style={{ color: "var(--cl-text)", opacity: 0.75 }}>
              <Heart size={15} /> Wishlist
            </Link>
            <button onClick={logout} data-testid="account-logout-button" className="flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap text-left transition-colors" style={{ color: "var(--cl-text)", opacity: 0.75 }}>
              <LogOut size={15} /> Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "overview" && (
            <div>
              <div className="p-6 mb-6" style={{ background: "var(--cl-surface)" }}>
                <div className="font-serif-display text-2xl" style={{ color: "var(--cl-text)" }}>Hey, {firstName} 👋</div>
                <p className="text-sm mt-1" style={{ color: "var(--cl-subtext)" }}>Here's what's happening with your account today.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="border p-5" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--cl-subtext)" }}>Orders</div>
                  <div className="text-3xl font-serif-display mb-2" style={{ color: "var(--cl-text)" }}>{orders.length}</div>
                  <button onClick={() => setTab("orders")} className="text-xs gold-underline flex items-center gap-1" style={{ color: "#C9A96E" }}>View all orders <ArrowRight size={12} /></button>
                </div>
                <div className="border p-5" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--cl-subtext)" }}>Wishlist</div>
                  <div className="text-3xl font-serif-display mb-2" style={{ color: "var(--cl-text)" }}>{wishlistItems.length}</div>
                  <Link to="/wishlist" className="text-xs gold-underline flex items-center gap-1" style={{ color: "#C9A96E" }}>View your wishlist <ArrowRight size={12} /></Link>
                </div>
                <div className="border p-5" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--cl-subtext)" }}>Loom Credits</div>
                  <div className="text-3xl font-serif-display mb-2" style={{ color: "var(--cl-text)" }}>{loom?.balance ?? 0}</div>
                  <span className="text-xs" style={{ color: "var(--cl-subtext)" }}>Worth {formatINR(loom?.value_inr ?? 0)}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border p-6" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>Recent Orders</div>
                    {orders.length > 0 && <button onClick={() => setTab("orders")} className="text-xs" style={{ color: "#C9A96E" }}>View all</button>}
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--cl-subtext)" }}>No orders yet. The atelier is patient.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((o) => (
                        <div key={o.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: "var(--cl-bg)" }}>
                            {o.items[0]?.image && <img src={o.items[0].image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate" style={{ color: "var(--cl-text)" }}>{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}</div>
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="text-sm shrink-0" style={{ color: "var(--cl-text)" }}>{formatINR(o.total)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border p-6" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>Account Details</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--cl-subtext)" }}>Name</div>
                      <div style={{ color: "var(--cl-text)" }}>{user.name}</div>
                    </div>
                    <div>
                      <div className="text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--cl-subtext)" }}>Email</div>
                      <div style={{ color: "var(--cl-text)" }}>{user.email}</div>
                    </div>
                    <div>
                      <div className="text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--cl-subtext)" }}>Member since</div>
                      <div style={{ color: "var(--cl-text)" }}>{memberSince}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <LoomCreditsCard data={loom} />
              </div>

              {user.is_admin && (
                <div className="mt-6">
                  <Link to="/admin" data-testid="account-admin-link" className="btn-gold inline-block">Open Admin</Link>
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h2 className="font-serif-display text-2xl mb-6" style={{ color: "var(--cl-text)" }}>Order History</h2>
              {orders.length === 0 ? (
                <div className="text-sm" style={{ color: "var(--cl-subtext)" }}>No orders yet. The atelier is patient.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="border p-6" style={{ borderColor: "rgba(201,169,110,0.15)" }} data-testid={`order-${o.id}`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>Order · {o.id.slice(0, 8)}</div>
                          <div className="mt-1" style={{ color: "var(--cl-text)" }}>{o.items.map((i) => i.name).join(" · ")}</div>
                          <div className="text-xs mt-1" style={{ color: "var(--cl-subtext)" }}>{new Date(o.created_at).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div style={{ color: "var(--cl-text)" }}>{formatINR(o.total)}</div>
                          {o.delhivery_awb && (
                            <div>
                              <div className="text-[11px] tracking-[0.2em] uppercase mt-2" style={{ color: "var(--cl-subtext)" }}>AWB · {o.delhivery_awb}</div>
                              <a href={`https://www.delhivery.com/track-v2/package/${o.delhivery_awb}`} target="_blank" rel="noopener noreferrer" className="text-[11px] tracking-[0.25em] uppercase gold-underline mt-1 inline-block" style={{ color: "#C9A96E" }}>Track Order ↗</a>
                            </div>
                          )}
                        </div>
                      </div>
                      <OrderTimeline status={o.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div className="border p-8 text-center" style={{ borderColor: "var(--cl-border)" }}>
              <MapPin size={24} className="mx-auto mb-4" style={{ color: "#C9A96E" }} />
              <div className="font-serif-display text-xl mb-2" style={{ color: "var(--cl-text)" }}>A saved address book is coming soon</div>
              <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--cl-subtext)" }}>
                For now, you enter your delivery address fresh at checkout each time.
              </p>
            </div>
          )}

          {tab === "details" && (
            <div className="border p-8" style={{ borderColor: "var(--cl-border)" }}>
              <h2 className="font-serif-display text-2xl mb-6" style={{ color: "var(--cl-text)" }}>Account Details</h2>
              <div className="space-y-5 max-w-sm">
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--cl-subtext)" }}>Name</div>
                  <div className="text-sm" style={{ color: "var(--cl-text)" }}>{user.name}</div>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--cl-subtext)" }}>Email</div>
                  <div className="text-sm" style={{ color: "var(--cl-text)" }}>{user.email}</div>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--cl-subtext)" }}>Member since</div>
                  <div className="text-sm" style={{ color: "var(--cl-text)" }}>{memberSince}</div>
                </div>
              </div>
              <p className="text-xs mt-8" style={{ color: "var(--cl-subtext)" }}>Editing your profile details isn't available yet.</p>
            </div>
          )}

          {tab === "password" && (
            <div className="border p-8 text-center" style={{ borderColor: "var(--cl-border)" }}>
              <Lock size={24} className="mx-auto mb-4" style={{ color: "#C9A96E" }} />
              <div className="font-serif-display text-xl mb-2" style={{ color: "var(--cl-text)" }}>Password changes aren't available yet</div>
              <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--cl-subtext)" }}>
                This is on the way. Reach out if you need your password reset in the meantime.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
