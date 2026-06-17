import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { formatINR, productImage, api } from "@/lib/api";
import { getProductBySlug, listProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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
            stroke={(hover || value) >= star ? "#C9A96E" : "#8A8FA8"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ slug }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, reviewer_name: "", title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const r = await api.get(`/reviews/${slug}`);
      setReviews(r.data.reviews);
      setAverage(r.data.average);
      setTotal(r.data.total);
    } catch (e) {}
  };

  useEffect(() => { fetchReviews(); }, [slug]);

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
      fetchReviews();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not submit review");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-32 border-t border-[#C9A96E]/15 pt-16">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Customer Reviews</div>
          <div className="flex items-center gap-4">
            <h3 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8]">
              {total > 0 ? (
                <><span className="italic text-[#C9A96E]/90">{average}</span> out of 5</>
              ) : (
                "No reviews yet"
              )}
            </h3>
            {total > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(average)} size={16} />
                <span className="text-[#8A8FA8] text-sm">({total})</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="border border-[#C9A96E]/20 p-8 mb-12 bg-[#0D1020]">
          <h4 className="font-serif-display text-2xl text-[#F5F0E8] mb-6">Your Review</h4>
          <div className="space-y-6">
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] block mb-3">Rating</label>
              <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} size={24} />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Your Name</label>
              <input value={form.reviewer_name} onChange={(e) => setForm(f => ({ ...f, reviewer_name: e.target.value }))} placeholder="e.g. Rahul M." />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Title (optional)</label>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Perfect fit" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Review</label>
              <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Tell us about your experience..." />
            </div>
            <button onClick={submit} disabled={submitting} className="btn-gold disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-[#8A8FA8] text-sm text-center py-12">
          Be the first to review this piece.
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[#C9A96E]/10 pb-8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <StarRating value={r.rating} size={14} />
                    {r.verified && (
                      <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] border border-[#C9A96E]/30 px-2 py-0.5">Verified</span>
                    )}
                  </div>
                  {r.title && <div className="font-serif-display text-lg text-[#F5F0E8]">{r.title}</div>}
                </div>
                <div className="text-right text-xs text-[#8A8FA8] whitespace-nowrap">
                  <div>{r.reviewer_name}</div>
                  <div>{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              </div>
              <p className="text-[#F5F0E8]/75 text-sm leading-relaxed">{r.body}</p>
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
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();

  useEffect(() => {
    const p = getProductBySlug(slug);
    setProduct(p);
    if (p) {
      // Meta Pixel — ViewContent
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: p.name,
          content_ids: [p.id],
          content_type: 'product',
          value: p.price,
          currency: 'INR',
        });
      }
      const requestedVariant = searchParams.get("variant");
      const initialIdx = requestedVariant
        ? Math.max(0, (p.variants || []).findIndex((v) => v.id === requestedVariant))
        : 0;
      setVariantIdx(initialIdx);
      const initialVariant = p.variants?.[initialIdx];
      const outOfStock = initialVariant?.out_of_stock_sizes || [];
      const firstAvailable = (p.sizes || []).find((s) => !outOfStock.includes(s)) || p.sizes?.[0] || null;
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
    return <div className="pt-40 text-center text-[#8A8FA8] tracking-[0.3em] uppercase text-sm">Loading...</div>;
  }

  const heroImg = images[activeImg] || productImage(product);

  const onAdd = () => {
    // Meta Pixel — AddToCart
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name + (variant ? ' · ' + variant.name : ''),
        content_ids: [product.id],
        content_type: 'product',
        value: product.price * qty,
        currency: 'INR',
      });
    }
    const productForCart = {
      ...product,
      images: images.length ? images : [productImage(product)],
    };
    const meta = { size, quantity: qty };
    if (variant) {
      addItem({ ...productForCart, name: `${product.name} · ${variant.name}` }, meta);
    } else {
      addItem(productForCart, meta);
    }
    toast.success(`${product.name}${variant ? " · " + variant.name : ""} added to your bag`, {
      description: size ? `Size · ${size}` : undefined,
    });
  };

  const onWish = async () => {
    const r = await toggle(product);
    if (r?.needsAuth) {
      toast("Sign in to save to your wishlist", { action: { label: "Sign in", onClick: () => (window.location.href = "/login") } });
    }
  };

  return (
    <div data-testid="product-detail-page" className="page-fade pt-28 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8] mb-8">
          <Link to="/" className="hover:text-[#C9A96E]">Home</Link> <span className="mx-2">/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-[#C9A96E] capitalize">{product.category}</Link> <span className="mx-2">/</span>
          <span className="text-[#F5F0E8]/85">{product.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div
              className="product-card-img-wrap aspect-[4/5] w-full mb-4"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e._startX = touch.clientX;
                e.currentTarget._startX = touch.clientX;
              }}
              onTouchEnd={(e) => {
                const startX = e.currentTarget._startX;
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    setActiveImg((prev) => (prev + 1) % images.length);
                  } else {
                    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
                  }
                }
              }}
            >
              {heroImg ? (
                <img src={heroImg} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8A8FA8] text-xs tracking-[0.3em] uppercase">
                  Awaiting Image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} data-testid={`product-thumb-${i}`} className={`aspect-square overflow-hidden border ${i === activeImg ? "border-[#C9A96E]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-5 lg:pt-6">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3 capitalize">{product.category}</div>
            <h1 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-[#F5F0E8] leading-[0.95]">{product.name}</h1>
            <div className="text-2xl text-[#F5F0E8]/85 mt-6">{formatINR(product.price)}</div>

            <p className="text-[#F5F0E8]/75 mt-8 leading-relaxed">{product.description}</p>

            {product.material && (
              <div className="mt-6 text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">
                Composition · <span className="text-[#F5F0E8]/85">{product.material}</span>
              </div>
            )}

            {/* Variant selector */}
            {product.variants?.length > 0 && (
              <div className="mt-10">
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
                  Variant · <span className="text-[#F5F0E8]/85">{variant?.name}</span>
                </div>
                <div className="grid grid-cols-6 gap-3" data-testid="product-variant-grid">
                  {product.variants.map((v, i) => {
                    const thumb = v.images?.[0];
                    const selected = i === variantIdx;
                    return (
                      <button
                        key={v.id || i}
                        onClick={() => {
                          setVariantIdx(i);
                          setActiveImg(0);
                          const outOfStock = v.out_of_stock_sizes || [];
                          if (!size || outOfStock.includes(size)) {
                            const firstAvailable = (product.sizes || []).find((s) => !outOfStock.includes(s)) || null;
                            setSize(firstAvailable);
                          }
                        }}
                        data-testid={`product-variant-${i}`}
                        title={v.name}
                        className={`aspect-square overflow-hidden border-2 transition-all ${selected ? "border-[#C9A96E]" : "border-transparent opacity-70 hover:opacity-100"}`}
                        style={!thumb && v.color_hex ? { backgroundColor: v.color_hex } : undefined}
                      >
                        {thumb ? (
                          <img src={thumb} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] tracking-[0.15em] uppercase text-[#F5F0E8]/70 bg-[#14172A]">
                            {v.name.replace(/[^0-9]/g, "") || v.name.slice(0,3)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">
                    Size · {size || "Out of stock"}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button data-testid="product-size-guide-trigger" className="text-[11px] tracking-[0.25em] uppercase text-[#F5F0E8]/80 gold-underline">Size Guide</button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0B0E1A] text-[#F5F0E8] border-[#C9A96E]/20">
                      <DialogHeader>
                        <DialogTitle className="font-serif-display text-3xl">Size Guide</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 text-sm">
                        <table className="w-full text-left">
                          <thead className="text-[#C9A96E] text-[11px] tracking-[0.2em] uppercase">
                            <tr><th className="py-2">Size</th><th>Chest (in)</th><th>Length (in)</th><th>Shoulder (in)</th></tr>
                          </thead>
                          <tbody className="text-[#F5F0E8]/80">
                            <tr className="border-t border-[#C9A96E]/15"><td className="py-3">M</td><td>40</td><td>27</td><td>17</td></tr>
                            <tr className="border-t border-[#C9A96E]/15"><td className="py-3">L</td><td>42</td><td>28</td><td>18</td></tr>
                            <tr className="border-t border-[#C9A96E]/15"><td className="py-3">XL</td><td>44</td><td>29</td><td>19</td></tr>
                          </tbody>
                        </table>
                        <p className="text-[#8A8FA8] text-xs mt-4">Measurements are approximate. Garments are cut relaxed; pick your usual size.</p>
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
                        className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all duration-300 ${
                          outOfStock
                            ? "border-[#8A8FA8]/15 text-[#8A8FA8]/30 line-through cursor-not-allowed"
                            : size === s
                            ? "border-[#C9A96E] text-[#C9A96E]"
                            : "border-[#8A8FA8]/30 text-[#F5F0E8]/80 hover:border-[#C9A96E]/60"
                        }`}
                      >{s}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex items-center border border-[#C9A96E]/30">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 text-[#F5F0E8] hover:text-[#C9A96E]"><Minus size={14} /></button>
                <span className="px-4 text-sm text-[#F5F0E8] w-10 text-center" data-testid="product-qty">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-3 text-[#F5F0E8] hover:text-[#C9A96E]"><Plus size={14} /></button>
              </div>
              <button
                data-testid="product-add-to-cart"
                onClick={onAdd}
                disabled={!size}
                className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {size ? "Add to Bag" : "Out of Stock"}
              </button>
              <button data-testid="product-wishlist-button" onClick={onWish} aria-label="Wishlist" className={`p-3 border ${has(product.id) ? "border-[#C9A96E] text-[#C9A96E]" : "border-[#C9A96E]/30 text-[#F5F0E8]"} hover:border-[#C9A96E]`}>
                <Heart size={16} fill={has(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="mt-12 divider-thin" />
            <div className="mt-6 text-[11px] tracking-[0.25em] uppercase text-[#8A8FA8] space-y-2">
              <div>Slow-shipped within 3–5 days · India</div>
              <div>Complimentary returns · 14 days</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection slug={slug} />

        {/* You May Also Like */}
        {related.length > 0 && (
          <div className="mt-32">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Continued Reading</div>
                <h3 className="font-serif-display text-3xl md:text-4xl text-[#F5F0E8]">You may also like</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p) => (
                <Link to={`/product/${p.slug}`} key={p.id} className="group">
                  <div className="product-card-img-wrap product-card-halo aspect-[3/4] mb-4">
                    {productImage(p) ? <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#8A8FA8] text-xs tracking-[0.3em] uppercase">Awaiting Image</div>}
                  </div>
                  <div className="font-serif-display text-xl text-[#F5F0E8]">{p.name}</div>
                  <div className="text-sm text-[#F5F0E8]/70 mt-1">{formatINR(p.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
