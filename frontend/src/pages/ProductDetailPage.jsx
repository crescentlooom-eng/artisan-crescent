import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Minus, Plus } from "lucide-react";
import { api, formatINR, productImage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [variantIdx, setVariantIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();

  useEffect(() => {
    (async () => {
      const r = await api.get(`/products/${slug}`);
      setProduct(r.data);
      setSize(r.data.sizes?.[0] || null);
      setVariantIdx(0);
      setActiveImg(0);
      const all = await api.get("/products", { params: { category: r.data.category } });
      setRelated(all.data.filter((p) => p.id !== r.data.id).slice(0, 4));
    })();
  }, [slug]);

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
    const productForCart = {
      ...product,
      // pass variant image into cart item
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
            <div className="product-card-img-wrap aspect-[4/5] w-full mb-4">
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
                        onClick={() => { setVariantIdx(i); setActiveImg(0); }}
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
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#C9A96E]">Size · {size}</div>
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
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      data-testid={`product-size-${s}`}
                      onClick={() => setSize(s)}
                      className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all duration-300 ${
                        size === s ? "border-[#C9A96E] text-[#C9A96E]" : "border-[#8A8FA8]/30 text-[#F5F0E8]/80 hover:border-[#C9A96E]/60"
                      }`}
                    >{s}</button>
                  ))}
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
              <button data-testid="product-add-to-cart" onClick={onAdd} className="btn-gold flex-1">Add to Bag</button>
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
