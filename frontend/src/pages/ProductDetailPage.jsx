import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, PackageCheck, ShieldCheck } from "lucide-react";
import { formatINR, productImage, api } from "@/lib/api";
import { getProductBySlug, listProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";

function StarRating({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className="transition-colors"
        >
          <Star
            size={size}
            fill={(hover || value) >= star ? "#C9A96E" : "none"}
            stroke={(hover || value) >= star ? "#C9A96E" : "var(--cl-subtext)"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ slug, average, total, reviews, onSubmitted }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, reviewer_name: "", title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.rating) return toast.error("Please select a rating");
    if (!form.reviewer_name.trim()) return toast.error("Please enter your name");
    if (form.body.trim().length < 10) return toast.error("Review must be at least 10 characters");
    setSubmitting(true);
    try {
      await api.post("/reviews", { ...form, product_slug: slug });
      toast.success("Review submitted!");
      setForm({ rating: 0, reviewer_name: "", title: "", body: "" });
      setShowForm(false);
      onSubmitted();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not submit review");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-32 border-t pt-16" style={{ borderColor: "var(--cl-border)" }}>
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: "#C9A96E" }}>Customer Reviews</div>
          <div className="flex items-center gap-4">
            <h3 className="font-serif-display text-3xl md:text-4xl" style={{ color: "var(--cl-text)" }}>
              {total > 0 ? (
                <><span className="italic" style={{ color: "#C9A96E" }}>{average}</span> out of 5</>
              ) : "No reviews yet"}
            </h3>
            {total > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(average)} size={16} />
                <span className="text-sm" style={{ color: "var(--cl-subtext)" }}>({total})</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <div className="border p-8 mb-12" style={{ borderColor: "rgba(201,169,110,0.2)", background: "var(--cl-surface)" }}>
          <h4 className="font-serif-display text-2xl mb-6" style={{ color: "var(--cl-text)" }}>Your Review</h4>
          <div className="space-y-6">
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase block mb-3" style={{ color: "var(--cl-subtext)" }}>Rating</label>
              <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} size={24} />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Your Name</label>
              <input value={form.reviewer_name} onChange={(e) => setForm(f => ({ ...f, reviewer_name: e.target.value }))} placeholder="e.g. Rahul M." />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Title (optional)</label>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Perfect fit" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Review</label>
              <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Tell us about your experience..." />
            </div>
            <button onClick={submit} disabled={submitting} className="btn-gold disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-sm text-center py-12" style={{ color: "var(--cl-subtext)" }}>Be the first to review this piece.</div>
      ) : (
        <div className="space-y-8">
          {reviews.map((r) => (
            <div key={r.id} className="border-b pb-8" style={{ borderColor: "var(--cl-border)" }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <StarRating value={r.rating} size={14} />
                    {r.verified && (
                      <span className="text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5" style={{ color: "#C9A96E", borderColor: "rgba(201,169,110,0.3)" }}>Verified</span>
                    )}
                  </div>
                  {r.title && <div className="font-serif-display text-lg" style={{ color: "var(--cl-text)" }}>{r.title}</div>}
                </div>
                <div className="text-right text-xs whitespace-nowrap" style={{ color: "var(--cl-subtext)" }}>
                  <div>{r.reviewer_name}</div>
                  <div>{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--cl-text)", opacity: 0.75 }}>{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();

  const fetchReviews = async () => {
    try {
      const r = await api.get(`/reviews/${slug}`);
      setReviews(r.data.reviews);
      setAverage(r.data.average);
      setTotal(r.data.total);
    } catch (e) {}
  };

  useEffect(() => { fetchReviews(); }, [slug]);

  useEffect(() => {
    const p = getProductBySlug(slug);
    setProduct(p);
    if (p) {
      if (window.fbq) {
        window.fbq('track', 'ViewContent', { content_name: p.name, content_ids: [p.id], content_type: 'product', value: p.price, currency: 'INR' });
      }
      const requestedVariant = searchParams.get("variant");
      const initialIdx = requestedVariant
        ? Math.max(0, (p.variants || []).findIndex((v) => v.id === requestedVariant))
        : 0;
      setVariantIdx(initialIdx);
      const initialVariant = p.variants?.[initialIdx];
      const outOfStock = initialVariant?.out_of_stock_sizes || [];
      const firstAvailable = initialVariant?.in_stock === false
        ? null
        : (p.sizes || []).find((s) => !outOfStock.includes(s)) || p.sizes?.[0] || null;
      setSize(firstAvailable);
      setActiveImg(0);
      setRelated(listProducts({ category: p.category }).filter((x) => x.id !== p.id).slice(0, 4));
    }
  }, [slug, searchParams]);

  const variant = product?.variants?.[variantIdx];
  const images = useMemo(() => {
    if (!product) return [];
    if (variant?.images?.length) return variant.images;
    if (product.images?.length) return product.images;
    return [];
  }, [product, variant]);

  if (!product) {
    return <div className="pt-40 text-center tracking-[0.3em] uppercase text-sm" style={{ color: "var(--cl-subtext)" }}>Loading...</div>;
  }

  const heroImg = images[activeImg] || productImage(product);
  const variantOutOfStock = variant?.in_stock === false;

  const buildCartItem = () => {
    const productForCart = { ...product, images: images.length ? images : [productImage(product)] };
    const meta = { size, quantity: qty };
    const finalProduct = variant ? { ...productForCart, name: `${product.name} · ${variant.name}` } : productForCart;
    return { finalProduct, meta };
  };

  const onAdd = () => {
    if (window.fbq) {
      window.fbq('track', 'AddToCart', { content_name: product.name + (variant ? ' · ' + variant.name : ''), content_ids: [product.id], content_type: 'product', value: product.price * qty, currency: 'INR' });
    }
    const { finalProduct, meta } = buildCartItem();
    addItem(finalProduct, meta);
    toast.success(`${product.name}${variant ? " · " + variant.name : ""} added to your bag`, {
      description: size ? `Size · ${size}` : undefined,
    });
  };

  const onBuyNow = () => {
    const { finalProduct, meta } = buildCartItem();
    addItem(finalProduct, meta);
    navigate("/checkout");
  };

  const onWish = async () => {
    const r = await toggle(product);
    if (r?.needsAuth) {
      toast("Sign in to save to your wishlist", { action: { label: "Sign in", onClick: () => (window.location.href = "/login") } });
    }
  };

  const checklist = [product.material, product.highlights?.fabric, product.highlights?.pattern, product.highlights?.neck_type].filter(Boolean);

  return (
    <div data-testid="product-detail-page" className="page-fade pt-28 md:pt-32 pb-24">
      <div className="max-w-none mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: "var(--cl-subtext)" }}>
          <Link to="/" className="hover:text-[#C9A96E]">Home</Link> <span className="mx-2">/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-[#C9A96E] capitalize">{product.category}</Link> <span className="mx-2">/</span>
          <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex gap-4">
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} data-testid={`product-thumb-${i}`} className="aspect-square overflow-hidden border" style={{ borderColor: i === activeImg ? "#C9A96E" : "transparent", opacity: i === activeImg ? 1 : 0.65 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1">
              <div
                className="product-card-img-wrap aspect-[4/5] w-full"
                onTouchStart={(e) => { if (images.length <= 1) return; e.currentTarget._startX = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (images.length <= 1) return;
                  const startX = e.currentTarget._startX;
                  if (startX === undefined) return;
                  const diff = startX -
