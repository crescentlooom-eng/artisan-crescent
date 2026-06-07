import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import useScrollReveal from "@/hooks/useScrollReveal";

const CATEGORIES = [
  { value: "all", label: "All Pieces" },
  { value: "outerwear", label: "Outerwear" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "accessories", label: "Accessories" },
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price · Low → High" },
  { value: "price-desc", label: "Price · High → Low" },
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  const category = params.get("category") || "all";
  const q = params.get("q") || "";

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.get("/products", { params: { category: category === "all" ? undefined : category, q: q || undefined } });
      setProducts(res.data);
      setLoading(false);
    })();
  }, [category, q]);

  useScrollReveal([products]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort]);

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === "all") next.delete("category"); else next.set("category", c);
    setParams(next, { replace: true });
  };

  return (
    <div data-testid="shop-page" className="page-fade pt-32 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">The Collection</div>
        <h1 className="font-serif-display text-5xl md:text-7xl text-[#F5F0E8] leading-[0.95]">
          {q ? <>Searching for <span className="italic text-[#C9A96E]/90">&ldquo;{q}&rdquo;</span></> : <>Every Piece, <span className="italic text-[#C9A96E]/90">Worth Wearing.</span></>}
        </h1>

        <div className="mt-12 md:mt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-[#C9A96E]/15">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                data-testid={`shop-filter-${c.value}`}
                onClick={() => setCategory(c.value)}
                className={`text-[11px] tracking-[0.3em] uppercase gold-underline ${category === c.value ? "active text-[#C9A96E]" : "text-[#F5F0E8]/80"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#8A8FA8]">Sort</span>
            <select data-testid="shop-sort-select" value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-transparent border border-[#C9A96E]/30 px-3 py-2 text-[#F5F0E8]">
              {SORTS.map((s) => <option key={s.value} value={s.value} className="bg-[#0B0E1A]">{s.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center text-[#8A8FA8] text-sm tracking-[0.2em] uppercase">Weaving...</div>
        ) : sorted.length === 0 ? (
          <div className="py-32 text-center">
            <div className="font-serif-display text-4xl text-[#F5F0E8]">Nothing found in this chapter.</div>
            <p className="text-[#8A8FA8] mt-4">Try another category or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16 mt-12">
            {sorted.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
