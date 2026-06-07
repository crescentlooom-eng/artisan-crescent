import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const EMPTY = {
  name: "", slug: "", category: "outerwear", price: 0, description: "",
  images: [], sizes: ["XS", "S", "M", "L", "XL"], colors: [], material: "",
  featured: false, new_arrival: false,
};

function ProductForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [imageInput, setImageInput] = useState("");
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      sizes: typeof form.sizes === "string" ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : form.sizes,
      colors: typeof form.colors === "string" ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : form.colors,
    };
    try {
      if (initial?.id) await api.put(`/admin/products/${initial.id}`, payload);
      else await api.post("/admin/products", payload);
      toast.success("Saved");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      set("images", [...(form.images || []), imageInput.trim()]);
      setImageInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0E1A] border border-[#C9A96E]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif-display text-3xl text-[#F5F0E8]">{initial?.id ? "Edit Piece" : "New Piece"}</h3>
          <button onClick={onClose} className="text-[#8A8FA8] hover:text-[#C9A96E]"><X /></button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Slug</label><input value={form.slug} onChange={(e) => set("slug", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="outerwear">Outerwear</option><option value="tops">Tops</option><option value="bottoms">Bottoms</option><option value="accessories">Accessories</option>
            </select>
          </div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Price (INR)</label><input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Material</label><input value={form.material || ""} onChange={(e) => set("material", e.target.value)} /></div>
          <div className="col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Description</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Sizes (comma-separated)</label><input value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes} onChange={(e) => set("sizes", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Colors (comma-separated)</label><input value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors} onChange={(e) => set("colors", e.target.value)} /></div>
          <div className="col-span-2">
            <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Image URLs</label>
            <div className="flex gap-2 mt-2">
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="https://..." />
              <button onClick={addImage} className="btn-gold px-4">Add</button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {(form.images || []).map((img, i) => (
                <div key={i} className="relative w-20 h-24">
                  <img src={img} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-[#0B0E1A] border border-[#C9A96E]/40 text-[#C9A96E] rounded-full w-5 h-5 text-xs">×</button>
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#F5F0E8]"><input type="checkbox" className="!w-auto" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm text-[#F5F0E8]"><input type="checkbox" className="!w-auto" checked={form.new_arrival} onChange={(e) => set("new_arrival", e.target.checked)} /> New Arrival</label>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={save} data-testid="admin-product-save" className="btn-gold flex-1">Save</button>
          <button onClick={onClose} className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] px-6">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [tab, setTab] = useState("products");

  const refresh = async () => {
    const [p, o] = await Promise.all([api.get("/products"), api.get("/admin/orders")]);
    setProducts(p.data);
    setOrders(o.data);
  };

  useEffect(() => { if (user?.is_admin) refresh(); }, [user]);

  if (loading) return <div className="pt-40 text-center text-[#8A8FA8] tracking-[0.3em] uppercase text-sm">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return (
    <div className="pt-40 text-center page-fade">
      <div className="font-serif-display text-4xl text-[#F5F0E8]">Restricted.</div>
      <p className="text-[#8A8FA8] mt-3">This room is for the atelier.</p>
    </div>
  );

  const del = async (id) => {
    if (!confirm("Delete this piece?")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success("Removed");
    refresh();
  };

  return (
    <div data-testid="admin-page" className="page-fade pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">Atelier</div>
      <h1 className="font-serif-display text-5xl md:text-6xl text-[#F5F0E8] leading-[0.95]">House <span className="italic text-[#C9A96E]/90">Administration</span></h1>

      <div className="mt-12 flex gap-8 border-b border-[#C9A96E]/15 pb-3">
        <button onClick={() => setTab("products")} data-testid="admin-tab-products" className={`text-[11px] tracking-[0.3em] uppercase gold-underline ${tab === "products" ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}>Pieces ({products.length})</button>
        <button onClick={() => setTab("orders")} data-testid="admin-tab-orders" className={`text-[11px] tracking-[0.3em] uppercase gold-underline ${tab === "orders" ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}>Orders ({orders.length})</button>
      </div>

      {tab === "products" && (
        <div className="mt-8">
          <button data-testid="admin-new-product" onClick={() => setEditing({})} className="btn-gold inline-flex items-center gap-2"><Plus size={14} /> New Piece</button>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {products.map((p) => (
              <div key={p.id} className="border border-[#C9A96E]/15 p-4 flex gap-4">
                <div className="w-20 h-24 bg-[#14172A] overflow-hidden flex-shrink-0">{p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif-display text-lg text-[#F5F0E8] truncate">{p.name}</div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{p.category} · {formatINR(p.price)}</div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditing(p)} data-testid={`admin-edit-${p.slug}`} className="text-[#C9A96E] hover:text-[#F5F0E8]"><Edit2 size={14} /></button>
                    <button onClick={() => del(p.id)} data-testid={`admin-delete-${p.slug}`} className="text-[#C9A96E] hover:text-[#F5F0E8]"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 space-y-3">
          {orders.length === 0 ? (
            <div className="text-[#8A8FA8] text-sm">No orders yet.</div>
          ) : orders.map((o) => (
            <div key={o.id} className="border border-[#C9A96E]/15 p-5 grid md:grid-cols-4 gap-3">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Order</div>
                <div className="text-[#F5F0E8] text-sm mt-1">{o.id.slice(0,12)}</div>
                <div className="text-xs text-[#8A8FA8] mt-1">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Customer</div>
                <div className="text-[#F5F0E8] text-sm mt-1">{o.shipping?.full_name}</div>
                <div className="text-xs text-[#8A8FA8]">{o.email}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Items</div>
                <div className="text-[#F5F0E8] text-sm mt-1 truncate">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="text-[#F5F0E8] text-lg">{formatINR(o.total)}</div>
                <div className={`text-[11px] tracking-[0.3em] uppercase mt-1 ${o.status === "paid" ? "text-[#C9A96E]" : "text-[#8A8FA8]"}`}>{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    </div>
  );
}
