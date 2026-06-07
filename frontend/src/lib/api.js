import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const productImage = (product, index = 0) => {
  // Prefer variant images; fall back to product.images
  if (product?.variants?.length) {
    for (const v of product.variants) {
      if (v.images?.length) return v.images[index] || v.images[0];
    }
  }
  return product?.images?.[index] || product?.images?.[0] || "";
};

export const allProductImages = (product) => {
  const out = [];
  for (const v of product?.variants || []) {
    for (const img of v.images || []) out.push(img);
  }
  for (const img of product?.images || []) out.push(img);
  return out;
};

/**
 * For the catalogue/featured grids, "explode" any product whose category
 * is `designer` into one card per variant (since each designer print is its
 * own piece). Polo & basics stay as a single card with their variant swatches
 * shown on the detail page.
 */
export const expandForCatalog = (products) => {
  const out = [];
  for (const p of products || []) {
    if (p.category === "designer" && (p.variants?.length || 0) > 1) {
      for (const v of p.variants) {
        const baseName = (p.name || "").replace(/\s*Tee\s*$/i, "").trim() || p.name;
        out.push({
          ...p,
          id: `${p.id}__${v.id}`,
          slug: p.slug,
          name: `${baseName} · ${v.name}`,
          images: (v.images && v.images.length) ? v.images : p.images,
          variants: [v],
          variantId: v.id,
          __isVariantCard: true,
        });
      }
    } else {
      out.push(p);
    }
  }
  return out;
};
