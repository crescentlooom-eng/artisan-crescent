import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PRODUCTS, listProducts } from "@/data/products";
import { expandForCatalog } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import useScrollReveal from "@/hooks/useScrollReveal";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  { value: "polo", label: "Textured Polos" },
  { value: "designer", label: "Prism Wear" },
  { value: "basics", label: "Essentials" },
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price · Low → High" },
  { value: "price-desc", label: "Price · High → Low" },
];

const PER_PAGE = 9;

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("newest");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState({ cat: true, size: true, color: true, price: true });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const category = params.get("category") || "all";
  const q = params.get("q") || "";

  const allCards = useMemo(() => expandForCatalog(PRODUCTS), []);
  const priceBounds = useMemo(() => {
    const prices = PRODUCTS.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, []);
  useEffect(() => { if (maxPrice === null) setMaxPrice(priceBounds.max); }, [priceBounds, maxPrice]);

  const allSizes = useMemo(() => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
    const set = new Set(PRODUCTS.flatMap((p) => p.sizes || []));
    return order.filter((s) => set.has(s));
  }, []);

  const allColors = useMemo(() => {
    const set = new Map();
    allCards.forEach((c) => { if (c.color_hex) set.set(c.color_hex, c.color_hex); });
    return Array.from(set.values());
  }, [allCards]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((c) => {
      counts[c.value] = allCards.filter((card) => card.category === c.value).length;
    });
    return counts;
  }, [allCards]);

  const filtered = useMemo(() => {
    const base = listProducts({ category: category === "all" ? undefined : category, q: q || undefined });
    let list = expandForCatalog(base);

    const seen = new Set();
    list = list.filter((p) => {
      const key = p.__isVariantCard ? `${p.slug}__${p.variantId}` : p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (sizes.length) list = list.filter((p) => sizes.some((s) => p.sizes?.includes(s)));
    if (colors.length) list = list.filter((p) => colors.includes(p.color_hex));
    if (maxPrice !== null) list = list.filter((p) => p.price <= maxPrice);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, q, sizes, colors, maxPrice, sort]);

  useScrollReveal([filtered, page]);
  useEffect(() => { setPage(1); }, [category, q, sizes, colors, maxPrice, sort]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === "all") next.delete("category"); else next.set("category", c);
    setParams(next, { replace: true });
  };
  const toggleSize = (s) => setSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleColor = (c) => setColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const clearAll = () => {
    setSizes([]); setColors([]); setMaxPrice(priceBounds.max); setSort("newest");
    const next = new URLSearchParams(params); next.delete("category"); next.delete("q");
    setParams(next, { replace: true });
  };

  const toggleGroup = (key) => setFiltersOpen((f) => ({ ...f, [key]: !f[key] }));
  const hasActiveFilters = category !== "all" || sizes.length || colors.length || (maxPrice !== null && maxPrice < priceBounds.max);
  const activeFilterCount = (category !== "all" ? 1 : 0) + sizes.length + colors.length + (maxPrice !== null && maxPrice < priceBounds.max ? 1 : 0);

  const FilterGroups = () => (
    <>
      <div className="border-b pb-5 mb-5" style={{ borderColor: "var(--cl-border)" }}>
        <button onClick={() => toggleGroup("cat")} className="flex items-center justify-between w-full mb-3">
          <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: "var(--cl-text)" }}>Categories</span>
          {filtersOpen.cat ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {filtersOpen.cat && (
          <div className="flex flex-col gap-2.5">
            <button onClick={() => setCategory("all")} className="flex items-center justify-between text-sm text-left" style={{ color: category === "all" ? "var(--cl-text)" : "var(--cl-subtext)" }}>
              <span>All Collections</span><span className="text-xs">({allCards.length})</span>
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCategory(c.value)} className="flex items-center justify-between text-sm text-left" style={{ color: category === c.value ? "var(--cl-text)" : "var(--cl-subtext)" }}>
                <span>{c.label}</span><span className="text-xs">({categoryCounts[c.value] || 0})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {allSizes.length > 0 && (
        <div className="border-b pb-5 mb-5" style={{ borderColor: "var(--cl-border)" }}>
          <button onClick={() => toggleGroup("size")} className="flex items-center justify-between w-full mb-3">
            <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: "var(--cl-text)" }}>Size</span>
            {filtersOpen.size ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {filtersOpen.size && (
            <div className="flex flex-col gap-2.5">
              {allSizes.map((s) => (
                <label key={s} className="cursor-pointer text-sm" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: "10px", color: "var(--cl-subtext)" }}>
                  <input type="checkbox" checked={sizes.includes(s)} onChange={() => toggleSize(s)} style={{ accentColor: "var(--cl-text)", margin: 0, flexShrink: 0, width: "16px", height: "16px" }} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {allColors.length > 0 && (
        <div className="border-b pb-5 mb-5" style={{ borderColor: "var(--cl-border)" }}>
          <button onClick={() => toggleGroup("color")} className="flex items-center justify-between w-full mb-3">
            <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: "var(--cl-text)" }}>Color</span>
            {filtersOpen.color ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {filtersOpen.color && (
            <div className="flex flex-wrap gap-3">
              {allColors.map((hex) => (
                <button key={hex} onClick={() => toggleColor(hex)} aria-label={hex} className="w-7 h-7 rounded-full" style={{ background: hex, border: colors.includes(hex) ? "2px solid var(--cl-text)" : "1px solid var(--cl-border)", boxShadow: colors.includes(hex) ? "0 0 0 2px var(--cl-bg), 0 0 0 3px var(--cl-text)" : "none" }} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pb-5">
        <button onClick={() => toggleGroup("price")} className="flex items-center justify-between w-full mb-3">
          <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: "var(--cl-text)" }}>Price</span>
          {filtersOpen.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {filtersOpen.price && maxPrice !== null && (
          <div>
            <input type="range" min={priceBounds.min} max={priceBounds.max} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" style={{ accentColor: "var(--cl-text)" }} />
            <div className="flex justify-between text-xs mt-2" style={{ color: "var(--cl-subtext)" }}><span>₹{priceBounds.min}</span><span>₹{maxPrice}</span></div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div data-testid="shop-page" className="page-fade pt-32 md:pt-40 pb-24">
      <div className="max-w-none mx-auto px-6 md:px-12">
        <div className="text-[11px] tracking-[0.4em] uppercase mb-3" style={{ color: "var(--cl-text)" }}>The Collection</div>
        <h1 className="font-serif-display text-4xl md:text-5xl mb-2" style={{ color: "var(--cl-text)" }}>
          {q ? <>Searching for &ldquo;{q}&rdquo;</> : "Shop"}
        </h1>
        <p className="text-sm mb-10 max-w-md" style={{ color: "var(--cl-subtext)" }}>
          Elevate your everyday style with our premium collections.
        </p>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>Filters</span>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-xs" style={{ color: "var(--cl-text)" }}>Clear all</button>
              )}
            </div>
            <FilterGroups />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex lg:hidden items-center gap-3 mb-6">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase border py-3"
                style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}
              >
                <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="flex-1 text-xs tracking-[0.15em] uppercase bg-transparent border py-3 px-3"
                style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}
              >
                {SORTS.map((s) => <option key={s.value} value={s.value} style={{ background: "var(--cl-bg)" }}>{s.label}</option>)}
              </select>
            </div>

            <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: "var(--cl-border)" }}>
              <span className="text-sm" style={{ color: "var(--cl-subtext)" }}>Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} products</span>
              <div className="flex items-center gap-3">
                <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--cl-subtext)" }}>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-transparent border px-3 py-2" style={{ borderColor: "var(--cl-border)", color: "var(--cl-text)" }}>
                  {SORTS.map((s) => <option key={s.value} value={s.value} style={{ background: "var(--cl-bg)" }}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <span className="text-xs" style={{ color: "var(--cl-subtext)" }}>Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} products</span>
            </div>

            {pageItems.length === 0 ? (
              <div className="py-32 text-center">
                <div className="font-serif-display text-4xl" style={{ color: "var(--cl-text)" }}>Nothing found in this chapter.</div>
                <p className="mt-4" style={{ color: "var(--cl-subtext)" }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-14">
                {pageItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className="w-9 h-9 rounded-full text-sm" style={page === i + 1 ? { background: "var(--cl-text)", color: "var(--cl-bg)" } : { border: "1px solid var(--cl-border)", color: "var(--cl-text)" }}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-2xl max-h-[85vh] flex flex-col"
            style={{ background: "var(--cl-bg)" }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b shrink-0" style={{ borderColor: "var(--cl-border)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>Filters</span>
              <div className="flex items-center gap-4">
                {hasActiveFilters && (
                  <button onClick={clearAll} className="text-xs" style={{ color: "var(--cl-text)" }}>Clear all</button>
                )}
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close" style={{ color: "var(--cl-text)" }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <FilterGroups />
            </div>
            <div className="px-6 py-5 border-t shrink-0" style={{ borderColor: "var(--cl-border)" }}>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-gold w-full"
              >
                Show {filtered.length} {filtered.length === 1 ? "Result" : "Results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
