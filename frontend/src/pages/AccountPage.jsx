import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { LayoutGrid, Package, Heart, MapPin, User as UserIcon, Lock, LogOut, ArrowRight, Loader2, Plus, Trash2, Check } from "lucide-react";
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
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={isDone ? { background: "#B8C0C8" } : { background: "transparent", border: "1px solid var(--cl-subtext)" }} />
              {!isLast && <div className="w-px flex-1 min-h-[22px]" style={{ background: isDone && i < activeIndex ? "#B8C0C8" : "var(--cl-border)" }} />}
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
  const color = status === "delivered" ? "#8FBC8F" : status === "cancelled" ? "#E57373" : "var(--cl-text)";
  return <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color }}>{label}</span>;
}

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "orders", label: "Orders", icon: Package },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "details", label: "Account Details", icon: UserIcon },
  { key: "password", label: "Password", icon: Lock },
];

function Avatar({ user, size = 64 }) {
  return (
    <div
      className="rounded-full overflow-hidden shrink-0"
      style={{ width: size, height: size, background: "var(--cl-surface)", border: "1px solid var(--cl-border)" }}
    >
      {user.picture ? (
        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-serif-display" style={{ color: "var(--cl-text)", fontSize: size * 0.4 }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function AvatarUpload({ user }) {
  const { setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(""); setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await api.post("/auth/upload-picture", form, { headers: { "Content-Type": "multipart/form-data" } });
      setUser((u) => ({ ...u, picture: r.data.picture }));
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Could not upload photo");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar user={user} size={64} />
      <div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs tracking-[0.2em] uppercase border px-4 py-2 flex items-center gap-2" style={{ borderColor: "var(--cl-text)", color: "var(--cl-text)" }}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : null}
          {uploading ? "Uploading..." : "Change Photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {msg && <p className="text-xs mt-2" style={{ color: "#E57373" }}>{msg}</p>}
      </div>
    </div>
  );
}

function PhoneField({ user }) {
  const { setUser } = useAuth();
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setMsg(""); setSaving(true);
    try {
      const r = await api.post("/auth/update-phone", { phone });
      setUser((u) => ({ ...u, phone: r.data.phone }));
      setMsg("Saved");
    } catch (e) {
      setMsg(e?.response?.data?.detail || "Could not save phone number");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: "var(--cl-subtext)" }}>Phone Number</div>
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210"
          className="flex-1 text-sm bg-transparent border px-3 py-2"
          style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}
        />
        <button onClick={save} disabled={saving} className="px-4 py-2 text-xs tracking-[0.2em] uppercase border shrink-0" style={{ borderColor: "var(--cl-text)", color: "var(--cl-text)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
        </button>
      </div>
      {msg && <p className="text-xs mt-2" style={{ color: msg === "Saved" ? "#8FBC8F" : "#E57373" }}>{msg}</p>}
    </div>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) { setMsg({ type: "error", text: "New password must be at least 8 characters" }); return; }
    setSaving(true);
    try {
      await api.post("/auth/change-password", { current_password: current || undefined, new_password: next });
      setMsg({ type: "success", text: "Password updated" });
      setCurrent(""); setNext("");
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.detail || "Could not update password" });
    }
    setSaving(false);
  };

  return (
    <div className="border p-8" style={{ borderColor: "var(--cl-border)" }}>
      <h2 className="font-serif-display text-2xl mb-2" style={{ color: "var(--cl-text)" }}>Password</h2>
      <p className="text-sm mb-6" style={{ color: "var(--cl-subtext)" }}>
        Signed in with Google and never set a password? Leave "Current Password" blank — this will create one you can use as a backup login.
      </p>
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Current Password (if you have one)</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Leave blank if signed in via Google" autoComplete="current-password" />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>New Password</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} placeholder="Min 8 characters" autoComplete="new-password" />
        </div>
        {msg && (
          <div className="text-sm px-4 py-3 border" style={{ color: msg.type === "error" ? "#E57373" : "#8FBC8F", borderColor: msg.type === "error" ? "rgba(229,115,115,0.4)" : "rgba(143,188,143,0.4)" }}>
            {msg.text}
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? "Saving..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    label: "", full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "", is_default: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/addresses");
      setAddresses(r.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ label: "", full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "", is_default: false });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      await api.post("/addresses", form);
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Could not save address");
    }
    setSaving(false);
  };

  const remove = async (id) => {
    await api.delete(`/addresses/${id}`);
    await load();
  };

  const makeDefault = async (id) => {
    await api.patch(`/addresses/${id}/default`);
    await load();
  };

  if (loading) {
    return <div className="text-sm" style={{ color: "var(--cl-subtext)" }}>Loading addresses...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif-display text-2xl" style={{ color: "var(--cl-text)" }}>Saved Addresses</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 text-xs">
          <Plus size={14} /> {showForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="border p-6 mb-8 space-y-4" style={{ borderColor: "var(--cl-border)", background: "var(--cl-surface)" }}>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Label (e.g. Home, Office)</label>
            <input value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} required placeholder="Home" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} required placeholder="Recipient's name" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="10-digit mobile number" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Address</label>
            <input value={form.address_line} onChange={(e) => setForm(f => ({ ...f, address_line: e.target.value }))} required placeholder="House no, street, area" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>City</label>
              <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} required />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>State</label>
              <input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} required />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Pincode</label>
              <input value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value }))} required maxLength={6} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--cl-text)" }}>
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm(f => ({ ...f, is_default: e.target.checked }))} style={{ accentColor: "var(--cl-text)" }} />
            Set as default address
          </label>
          {msg && <div className="text-sm px-4 py-3 border" style={{ color: "#E57373", borderColor: "rgba(229,115,115,0.4)" }}>{msg}</div>}
          <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50">
            {saving ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="border p-8 text-center" style={{ borderColor: "var(--cl-border)" }}>
          <MapPin size={24} className="mx-auto mb-4" style={{ color: "var(--cl-text)" }} />
          <div className="font-serif-display text-xl mb-2" style={{ color: "var(--cl-text)" }}>No saved addresses yet</div>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--cl-subtext)" }}>
            Add an address above to save it for faster checkout next time.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="border p-5" style={{ borderColor: a.is_default ? "var(--cl-text)" : "var(--cl-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>{a.label}</span>
                  {a.is_default && (
                    <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 border" style={{ color: "var(--cl-text)", borderColor: "var(--cl-border)" }}>Default</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!a.is_default && (
                    <button onClick={() => makeDefault(a.id)} aria-label="Set as default" className="p-1" style={{ color: "var(--cl-subtext)" }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => remove(a.id)} aria-label="Delete" className="p-1" style={{ color: "#E57373" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--cl-text)" }}>{a.full_name}</div>
              <div className="text-xs mt-1" style={{ color: "var(--cl-subtext)" }}>{a.address_line}, {a.city}, {a.state} {a.pincode}</div>
              <div className="text-xs mt-1" style={{ color: "var(--cl-subtext)" }}>{a.phone}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div className="text-[11px] tracking-[0.4em] uppercase mb-3" style={{ color: "var(--cl-text)" }}>Your House</div>
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
                  style={active ? { background: "var(--cl-surface)", color: "var(--cl-text)", borderLeft: "2px solid var(--cl-text)" } : { color: "var(--cl-text)", opacity: 0.75, borderLeft: "2px solid transparent" }}
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
              <div className="p-6 mb-6 flex items-center gap-5" style={{ background: "var(--cl-surface)" }}>
                <Avatar user={user} size={56} />
                <div>
                  <div className="font-serif-display text-2xl" style={{ color: "var(--cl-text)" }}>Hey, {firstName} 👋</div>
                  <p className="text-sm mt-1" style={{ color: "var(--cl-subtext)" }}>Here's what's happening with your account today.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="border p-5" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--cl-subtext)" }}>Orders</div>
                  <div className="text-3xl font-serif-display mb-2" style={{ color: "var(--cl-text)" }}>{orders.length}</div>
                  <button onClick={() => setTab("orders")} className="text-xs gold-underline flex items-center gap-1" style={{ color: "var(--cl-text)" }}>View all orders <ArrowRight size={12} /></button>
                </div>
                <div className="border p-5" style={{ borderColor: "var(--cl-border)" }}>
                  <div className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--cl-subtext)" }}>Wishlist</div>
                  <div className="text-3xl font-serif-display mb-2" style={{ color: "var(--cl-text)" }}>{wishlistItems.length}</div>
                  <Link to="/wishlist" className="text-xs gold-underline flex items-center gap-1" style={{ color: "var(--cl-text)" }}>View your wishlist <ArrowRight size={12} /></Link>
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
                    {orders.length > 0 && <button onClick={() => setTab("orders")} className="text-xs" style={{ color: "var(--cl-text)" }}>View all</button>}
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
                    <div key={o.id} className="border p-6" style={{ borderColor: "rgba(184,192,200,0.15)" }} data-testid={`order-${o.id}`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-text)" }}>Order · {o.id.slice(0, 8)}</div>
                          <div className="mt-1" style={{ color: "var(--cl-text)" }}>{o.items.map((i) => i.name).join(" · ")}</div>
                          <div className="text-xs mt-1" style={{ color: "var(--cl-subtext)" }}>{new Date(o.created_at).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div style={{ color: "var(--cl-text)" }}>{formatINR(o.total)}</div>
                          {o.delhivery_awb && (
                            <div>
                              <div className="text-[11px] tracking-[0.2em] uppercase mt-2" style={{ color: "var(--cl-subtext)" }}>AWB · {o.delhivery_awb}</div>
                              <a href={`https://www.delhivery.com/track-v2/package/${o.delhivery_awb}`} target="_blank" rel="noopener noreferrer" className="text-[11px] tracking-[0.25em] uppercase gold-underline mt-1 inline-block" style={{ color: "var(--cl-text)" }}>Track Order ↗</a>
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

                    {tab === "addresses" && <AddressesTab />}
          {tab === "details" && (
            <div className="border p-8" style={{ borderColor: "var(--cl-border)" }}>
              <h2 className="font-serif-display text-2xl mb-6" style={{ color: "var(--cl-text)" }}>Account Details</h2>
              <div className="mb-8">
                <AvatarUpload user={user} />
              </div>
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
                <PhoneField user={user} />
              </div>
              <p className="text-xs mt-8" style={{ color: "var(--cl-subtext)" }}>Editing your name or email isn't available yet.</p>
            </div>
          )}

          {tab === "password" && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}
