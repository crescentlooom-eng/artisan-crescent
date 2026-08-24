import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, PackageCheck, ShieldCheck, MapPin, Loader2, Moon } from "lucide-react";
import { formatINR, productImage, api } from "@/lib/api";
import { getProductBySlug, listProducts, getVariantImages } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTheme } from "@/context/ThemeContext";
import ProductCard from "@/components/ProductCard";
import useScrollReveal from "@/hooks/useScrollReveal";
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
            fill={(hover || value) >= star ? "#B8C0C8" : "none"}
            stroke={(hover || value) >= star ? "#B8C0C8" : "var(--cl-subtext)"}
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
          <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--cl-text)" }}>Customer Reviews</div>
          <div className="flex items-center gap-4">
            <h3 className="font-serif-display text-3xl md:text-4xl" style={{ color: "var(--cl-text)" }}>
              {total > 0 ? (
                <><span className="italic" style={{ color: "var(--cl-text)" }}>{average}</span> out of 5</>
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
        <div className="border p-8 mb-12" style={{ borderColor: "rgba(184,192,200,0.2)", background: "var(--cl-surface)" }}>
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
                      <span className="text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5" style={{ color: "var(--cl-text)", borderColor: "rgba(184,192,200,0.3)" }}>Verified</span>
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
  const { theme } = useTheme();
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
  useScrollReveal([related]);

  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeError("Enter a valid 6-digit pincode");
      setPincodeResult(null);
      return;
    }
    setPincodeError("");
    setPincodeLoading(true);
    setPincodeResult(null);
    try {
      const r = await api.get(`/check-pincode/${pincode}`);
      setPincodeResult(r.data);
    } catch (e) {
      setPincodeError(e?.response?.data?.detail || "Could not check this pincode right now");
    }
    setPincodeLoading(false);
  };

  const onImgMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(1.9)" });
  };

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
    setPincode(""); setPincodeResult(null); setPincodeError("");
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

      const otherProducts = listProducts({}).filter((x) => x.id !== p.id);
      const expandedOthers = otherProducts.flatMap((op) =>
        op.variants?.length > 0
          ? op.variants.map((v) => ({
              ...op, id: `${op.id}__${v.id}`, variantId: v.id,
              images: getVariantImages(v, theme)?.length ? getVariantImages(v, theme) : op.images,
              variants: [], color_hex: v.color_hex, __isVariantCard: true,
            }))
          : [op]
      );
      setRelated(expandedOthers.slice(0, 4));
    }
  }, [slug, searchParams]);

  const variant = product?.variants?.[variantIdx];
  const images = useMemo(() => {
    if (!product) return [];
    const variantImages = getVariantImages(variant, theme);
    if (variantImages.length) return variantImages;
    if (product.images?.length) return product.images;
    return [];
  }, [product, variant, theme]);

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

    const checklist = [product.highlights?.fabric, product.highlights?.pattern, product.highlights?.neck_type].filter(Boolean);
  return (
    <div data-testid="product-detail-page" className="page-fade pt-28 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-8" style={{ color: "var(--cl-subtext)" }}>
          <Link to="/" className="hover:text-[#B8C0C8]">Home</Link> <span className="mx-2">/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-[#B8C0C8] capitalize">{product.category}</Link> <span className="mx-2">/</span>
          <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex gap-4">
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} data-testid={`product-thumb-${i}`} className="aspect-square overflow-hidden border" style={{ borderColor: i === activeImg ? "#B8C0C8" : "transparent", opacity: i === activeImg ? 1 : 0.65 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1">
              <div
                className="product-card-img-wrap aspect-[4/5] w-full"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={onImgMouseMove}
                onTouchStart={(e) => { if (images.length <= 1) return; e.currentTarget._startX = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (images.length <= 1) return;
                  const startX = e.currentTarget._startX;
                  if (startX === undefined) return;
                  const diff = startX - e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) setActiveImg((prev) => (prev + 1) % images.length);
                    else setActiveImg((prev) => (prev - 1 + images.length) % images.length);
                  }
                }}
              >
                {heroImg ? (
                  <img
                    src={heroImg}
                    alt={product.name}
                    className="w-full h-full object-cover hidden md:block cursor-zoom-in"
                    style={isZooming ? { ...zoomStyle, transition: "transform 0.05s linear" } : { transition: "transform 0.3s ease" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs tracking-[0.3em] uppercase" style={{ color: "var(--cl-subtext)" }}>Awaiting Image</div>
                )}
                {heroImg && (
                  <img src={heroImg} alt={product.name} className="w-full h-full object-cover md:hidden" />
                )}
              </div>

              {images.length > 1 && (
                <div className="flex md:hidden gap-3 mt-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className="w-16 h-16 shrink-0 overflow-hidden border" style={{ borderColor: i === activeImg ? "#B8C0C8" : "transparent" }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 divider-thin" />
              <div className="grid grid-cols-3 gap-3 mt-8">
                {[[Truck, "Free Shipping", "Over ₹499"], [PackageCheck, "Easy Returns", "7-day policy"], [ShieldCheck, "Secure Payment", "100% safe"]].map(([Icon, title, sub]) => (
                  <div key={title} className="text-center">
                    <div className="w-9 h-9 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: "var(--cl-surface)" }}>
                      <Icon size={14} style={{ color: "var(--cl-text)" }} />
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: "var(--cl-text)" }}>{title}</div>
                    <div className="text-[10px]" style={{ color: "var(--cl-subtext)" }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 divider-thin" />
              <div className="mt-6 space-y-2">
                {["Delivered within 3–5 days · Delhi NCR", "Return & Exchange · 7 days", "Made in India"].map((point) => (
                  <div key={point} className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--cl-subtext)" }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#B8C0C8" }} />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 lg:pt-6">
            <h1 className="font-serif-display text-4xl md:text-5xl leading-[0.95]" style={{ color: "var(--cl-text)" }}>{product.name}</h1>
                        <div className="text-2xl mt-4 flex items-center gap-3" style={{ color: "var(--cl-text)", opacity: 0.85 }}>
              {product.salePrice ? (
                <>
                  <span className="line-through opacity-50 text-lg">{formatINR(product.price)}</span>
                  <span>{formatINR(product.salePrice)}</span>
                </>
              ) : (
                formatINR(product.price)
              )}
            </div>

            {total > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <StarRating value={Math.round(average)} size={14} />
                <span className="text-sm" style={{ color: "var(--cl-subtext)" }}>({total} review{total !== 1 ? "s" : ""})</span>
              </div>
            )}

            {product.description && (
              <p className="mt-6 leading-relaxed text-sm" style={{ color: "var(--cl-subtext)" }}>{product.description}</p>
            )}

            {checklist.length > 0 && (
              <div className="mt-6 space-y-2">
                {checklist.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--cl-text)" }}>
                    <span style={{ color: "#B8C0C8" }}>✓</span> {item}
                  </div>
                ))}
              </div>
            )}

            {product.variants?.length > 0 && (
              <div className="mt-10">
                <div className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: "var(--cl-text)" }}>
  Variant · <span style={{ color: "var(--cl-text)", opacity: 0.85 }}>{variant?.name}</span>
</div>
                <div className="grid grid-cols-6 gap-3" data-testid="product-variant-grid">
                  {product.variants.map((v, i) => {
                    const thumb = getVariantImages(v, theme)[0];
                    const selected = i === variantIdx;
                    return (
                      <button
                        key={v.id || i}
                        onClick={() => {
                          setVariantIdx(i);
                          setActiveImg(0);
                          if (v.in_stock === false) { setSize(null); }
                          else {
                            const outOfStock = v.out_of_stock_sizes || [];
                            if (!size || outOfStock.includes(size)) {
                              setSize((product.sizes || []).find((s) => !outOfStock.includes(s)) || null);
                            }
                          }
                        }}
                        data-testid={`product-variant-${i}`}
                        title={v.name}
                        className="aspect-square overflow-hidden border-2 transition-all relative"
                        style={{
                          borderColor: selected ? "#B8C0C8" : "transparent",
                          opacity: selected ? 1 : 0.7,
                          backgroundColor: !thumb && v.color_hex ? v.color_hex : undefined,
                        }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] tracking-[0.15em] uppercase" style={{ color: "var(--cl-text)", opacity: 0.7, background: "var(--cl-surface)" }}>
                            {v.name.replace(/[^0-9]/g, "") || v.name.slice(0,3)}
                          </div>
                        )}
                        {v.in_stock === false && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--cl-header-bg)" }}>
                            <div className="w-full h-[1px] absolute rotate-45" style={{ background: "var(--cl-subtext)", opacity: 0.5 }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {variantOutOfStock && (
              <div className="mt-6 text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--cl-subtext)" }}>
                <span style={{ color: "#E57373" }}>Currently unavailable</span> — this design is out of stock.
              </div>
            )}

            {product.sizes?.length > 0 && !variantOutOfStock && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--cl-text)" }}>Size · {size || "Out of stock"}</div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button data-testid="product-size-guide-trigger" className="text-[11px] tracking-[0.25em] uppercase gold-underline" style={{ color: "var(--cl-text)", opacity: 0.8 }}>Size Guide</button>
                    </DialogTrigger>
                    <DialogContent className="bg-[var(--cl-bg)] text-[var(--cl-text)] border-[var(--cl-border)]">
                      <DialogHeader>
                        <DialogTitle className="font-serif-display text-3xl">Size Guide</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 text-sm">
                        <table className="w-full text-left">
                          <thead className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--cl-text)" }}>
                            <tr><th className="py-2">Size</th><th>Chest (in)</th><th>Length (in)</th><th>Shoulder (in)</th></tr>
                          </thead>
                          <tbody style={{ color: "var(--cl-text)", opacity: 0.8 }}>
                            {product.slug === "textured-polo-tee" && <>
                              <tr className="border-t" style={{ borderColor: "var(--cl-border)" }}><td className="py-3">M</td><td>36</td><td>26.5</td><td>15.5</td></tr>
                              <tr className="border-t" style={{ borderColor: "var(--cl-border)" }}><td className="py-3">L</td><td>37</td><td>26.5</td><td>17</td></tr>
                              <tr className="border-t" style={{ borderColor: "var(--cl-border)" }}><td className="py-3">XL</td><td>40</td><td>28.5</td><td>17</td></tr>
                            </>}
                                                        {product.slug === "essential-tee" && <>
                              <tr className="border-t" style={{ borderColor: "var(--cl-border)" }}><td className="py-3">S</td><td>35</td><td>25.2</td><td>15</td></tr>
                              <tr className="border-t" style={{ borderColor: "var(--cl-border)" }}><td className="py-3">M</td><td>37</td><td>25.5</td><td>16.5</td></tr>
                            </>}
                            {product.slug === "prism-wear-tee" && <>
                              <tr className="border-t" style={{ borderColor: "var(--cl-border)" }}><td className="py-3">Free Size</td><td>41</td><td>28.5</td><td>18</td></tr>
                            </>}
                          </tbody>
                        </table>
                        <p className="text-xs mt-4" style={{ color: "var(--cl-subtext)" }}>Measurements are approximate. Garments are cut relaxed; pick your usual size.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => {
                    const outOfStock = variant?.out_of_stock_sizes?.includes(s);
                    return (
                      <button
                        key={s}
                        data-testid={`product-size-${s}`}
                        onClick={() => !outOfStock && setSize(s)}
                        disabled={outOfStock}
                        className="px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all duration-300"
                        style={outOfStock
                          ? { borderColor: "var(--cl-border)", color: "var(--cl-subtext)", opacity: 0.4, textDecoration: "line-through", cursor: "not-allowed" }
                          : size === s
                          ? { borderColor: "var(--cl-text)", color: "var(--cl-text)" }
                          : { borderColor: "var(--cl-border)", color: "var(--cl-text)", opacity: 0.8 }}
                      >{s}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center gap-4">
              <div className="flex items-center border" style={{ borderColor: "rgba(184,192,200,0.3)" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3" style={{ color: "var(--cl-text)" }}><Minus size={14} /></button>
                <span className="px-4 text-sm w-10 text-center" style={{ color: "var(--cl-text)" }} data-testid="product-qty">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-3" style={{ color: "var(--cl-text)" }}><Plus size={14} /></button>
              </div>
              <button data-testid="product-wishlist-button" onClick={onWish} aria-label="Wishlist" className="p-3 border" style={{ borderColor: has(product.id) ? "#B8C0C8" : "rgba(184,192,200,0.3)", color: has(product.id) ? "#B8C0C8" : "var(--cl-text)" }}>
                <Heart size={16} fill={has(product.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button
                data-testid="product-add-to-cart"
                onClick={onAdd}
                disabled={!size || variantOutOfStock}
                className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {variantOutOfStock ? "Out of Stock" : size ? "Add to Bag" : "Out of Stock"}
              </button>
              <button
                data-testid="product-buy-now"
                onClick={onBuyNow}
                disabled={!size || variantOutOfStock}
                className="flex-1 py-3 text-sm font-medium tracking-wide border disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--cl-text)", color: "var(--cl-text)" }}
                >
                Buy Now
                </button>
            </div>

            <div className="mt-5 flex items-center gap-3 border px-4 py-3" style={{ borderColor: "rgba(184,192,200,0.25)", background: "var(--cl-surface)" }}>
              <Moon size={16} style={{ color: "#B8C0C8" }} />
              <div className="text-xs" style={{ color: "var(--cl-text)", opacity: 0.85 }}>
              Earn <span style={{ color: "var(--cl-text)", fontWeight: 500 }}>1 Loom Credit Card</span> (worth ₹5) with this order — collect 3 to redeem.
              </div>
            </div>

            <div className="mt-4 border px-4 py-4" style={{ borderColor: "var(--cl-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} style={{ color: "#B8C0C8" }} />
                <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: "var(--cl-text)" }}>Check Delivery</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 text-sm bg-transparent border px-3 py-2"
                  style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}
                />
                <button
                  onClick={checkPincode}
                  disabled={pincodeLoading}
                  className="px-4 py-2 text-xs tracking-[0.2em] uppercase border shrink-0"
                  style={{ borderColor: "var(--cl-text)", color: "var(--cl-text)" }}
                  >
                  {pincodeLoading ? <Loader2 size={14} className="animate-spin" /> : "Check"}
                </button>
              </div>
              {pincodeError && <p className="text-xs mt-2" style={{ color: "#E57373" }}>{pincodeError}</p>}
              {pincodeResult && (
                pincodeResult.serviceable ? (
                  <div className="text-xs mt-3 space-y-1" style={{ color: "var(--cl-subtext)" }}>
                    <div style={{ color: "#8FBC8F" }}>✓ Delivers to {pincodeResult.city || "your area"}{pincodeResult.state ? `, ${pincodeResult.state}` : ""}</div>
                    <div>Estimated delivery: {pincodeResult.estimated_days}</div>
                    <div>{pincodeResult.cod ? "✓ Cash on Delivery available" : "Prepaid only for this pincode"}</div>
                  </div>
                ) : (
                  <div className="text-xs mt-3" style={{ color: "#E57373" }}>Sorry, we don't deliver to this pincode yet.</div>
                )
              )}
            </div>
          </div>
        </div>

        <ReviewsSection slug={slug} average={average} total={total} reviews={reviews} onSubmitted={fetchReviews} />

        {related.length > 0 && (
          <div className="mt-32">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--cl-text)" }}>Continued Reading</div>
                <h3 className="font-serif-display text-3xl md:text-4xl" style={{ color: "var(--cl-text)" }}>You may also like</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
