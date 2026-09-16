// Product helper functions for Crescent Loom.
// Products now live in MongoDB and are fetched live via the `/products` API
// (see lib/api.js's `api` client). These helpers operate on whatever product
// array you pass in — typically state populated via `api.get("/products")`.

export const getVariantImages = (variant, theme) => {
  if (!variant) return [];
  if (theme === "light" && variant.imagesLight?.length) return variant.imagesLight;
  return variant.images || [];
};

export const getProductBySlug = (products, slug) =>
  (products || []).find((p) => p.slug === slug) || null;

export const listProducts = (products, { category, featured, new_arrival, q } = {}) => {
  let out = [...(products || [])];
  if (category && category !== "all") out = out.filter((p) => p.category === category);
  if (featured !== undefined) out = out.filter((p) => p.featured === featured);
  if (new_arrival !== undefined) out = out.filter((p) => p.new_arrival === new_arrival);
  if (q) {
    const s = q.toLowerCase();
    out = out.filter((p) =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s) ||
      p.material?.toLowerCase().includes(s) ||
      (p.keywords || []).some((k) => k.toLowerCase().includes(s)) ||
      (p.variants || []).some((v) => v.name?.toLowerCase().includes(s))
    );
  }
  return out;
};
