import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X, Star } from "lucide-react";
import VariantEditor from "@/components/admin/VariantEditor";
import LoomCreditsAdmin from "@/components/admin/LoomCreditsAdmin";

const EMPTY = {
  name: "", slug: "", category: "polo", price: 0, description: "",
  images: [], sizes: ["M", "L", "XL"], colors: [], material: "",
  variants: [], featured: false, new_arrival: false,
};

function ProductForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, variants: initial?.variants || [] });
  const [imageInput, setImageInput] = useState("");
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      sizes: typeof form.sizes === "string" ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : form.sizes,
      colors: typeof form.colors === "string" ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : form.colors,
      variants: form.variants || [],
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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0E1A] border border-[#C9A96E]/20 max-w-3xl w-full p-8 my-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif-display text-3xl text-[#F5F0E8]">{initial?.id ? "Edit Piece" : "New Piece"}</h3>
          <button onClick={onClose} className="text-[#8A8FA8] hover:text-[#C9A96E]"><X /></button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Slug</label><input value={form.slug} onChange={(e) => set("slug", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="polo">Polo / Structured Tees</option>
              <option value="designer">Designer / Graphic Tees</option>
              <option value="basics">Basics / Essentials</option>
              <option value="outerwear">Outerwear</option>
              <option value="tops">Tops</option>
              <option value="bottoms">Bottoms</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Price (INR)</label><input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
          <div><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Material</label><input value={form.material || ""} onChange={(e) => set("material", e.target.value)} /></div>
          <div className="col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Description</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
          <div className="col-span-2"><label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Sizes (comma-separated)</label><input value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes} onChange={(e) => set("sizes", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm text-[#F5F0E8]"><input type="checkbox" className="!w-auto" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm text-[#F5F0E8]"><input type="checkbox" className="!w-auto" checked={form.new_arrival} onChange={(e) => set("new_arrival", e.target.checked)} /> New Arrival</label>
        </div>
        <div className="mt-6">
          <VariantEditor variants={form.variants || []} onChange={(v) => set("variants", v)} />
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={save} data-testid="admin-product-save" className="btn-gold flex-1">Save</button>
          <button onClick={onClose} className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] px-6">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/reviews");
      setReviews(r.data);
    } catch (e) {
      toast.error("Could not load reviews");
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const deleteReview = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch (e) {
      toast.error("Could not delete review");
    }
  };

  if (loading) return <div className="text-[#8A8FA8] text-sm mt-8">Loading reviews...</div>;

  return (
    <div className="mt-8">
      <div className="text-[#8A8FA8] text-sm mb-6">{reviews.length} total reviews</div>
      {reviews.length === 0 ? (
        <div className="text-[#8A8FA8] text-sm">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-[#C9A96E]/15 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={13} fill={r.rating >= s ? "#C9A96E" : "none"} stroke={r.rating >= s ? "#C9A96E" : "#8A8FA8"} />
                      ))}
                    </div>
                    <span className="text-[11px] tracking-[0.2em] uppercase text-[#C9A96E]">{r.product_slug}</span>
                    {r.verified && <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] border border-[#C9A96E]/30 px-2 py-0.5">Verified</span>}
                  </div>
                  {r.title && <div className="font-serif-display text-lg text-[#F5F0E8] mb-1">{r.title}</div>}
                  <p className="text-[#F5F0E8]/75 text-sm leading-relaxed mb-2">{r.body}</p>
                  <div className="text-xs text-[#8A8FA8]">
                    {r.reviewer_name} · {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <button onClick={() => deleteReview(r.id)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("products");

  const refresh = async () => {
    const [p, o] = await Promise.all([api.get("/products"), api.get("/admin/orders")]);
    setProducts(p.data);
    setOrders(o.data);
  };

  useEffect(() => { refresh(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this piece?")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success("Removed");
    refresh();
  };

  return (
    <div data-testid="admin-page" className="page-fade max-w-7xl">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">Atelier</div>
      <h1 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8]">Pieces</h1>

      <div className="mt-8 flex gap-8 border-b border-[#C9A96E]/15 pb-3 overflow-x-auto">
        <button onClick={() => setTab("products")} className={`text-[11px] tracking-[0.3em] uppercase gold-underline whitespace-nowrap ${tab === "products" ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}>Pieces ({products.length})</button>
        <button onClick={() => setTab("orders")} className={`text-[11px] tracking-[0.3em] uppercase gold-underline whitespace-nowrap ${tab === "orders" ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}>Orders ({orders.length})</button>
        <button onClick={() => setTab("loom")} className={`text-[11px] tracking-[0.3em] uppercase gold-underline whitespace-nowrap ${tab === "loom" ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}>Loom Credits</button>
        <button onClick={() => setTab("reviews")} className={`text-[11px] tracking-[0.3em] uppercase gold-underline whitespace-nowrap ${tab === "reviews" ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}>Reviews</button>
      </div>

      {tab === "products" && (
        <div className="mt-8">
          <button data-testid="admin-new-product" onClick={() => setEditing({})} className="btn-gold inline-flex items-center gap-2"><Plus size={14} /> New Piece</button>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {products.map((p) => (
              <div key={p.id} className="border border-[#C9A96E]/15 p-4 flex gap-4">
                <div className="w-20 h-24 bg-[#14172A] overflow-hidden flex-shrink-0">{(p.variants?.find(v => v.images?.length)?.images?.[0] || p.images?.[0]) && <img src={p.variants?.find(v => v.images?.length)?.images?.[0] || p.images?.[0]} className="w-full h-full object-cover" alt="" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif-display text-lg text-[#F5F0E8] truncate">{p.name}</div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-[#8A8FA8] mt-1">{p.category} · {formatINR(p.price)}</div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditing(p)} className="text-[#C9A96E] hover:text-[#F5F0E8]"><Edit2 size={14} /></button>
                    <button onClick={() => del(p.id)} className="text-[#C9A96E] hover:text-[#F5F0E8]"><Trash2 size={14} /></button>
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

      {tab === "loom" && <LoomCreditsAdmin />}
      {tab === "reviews" && <ReviewsTab />}

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    </div>
  );
}
