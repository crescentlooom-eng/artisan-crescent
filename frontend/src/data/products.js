// Static product catalogue for Crescent Loom.
// No backend dependency — catalogue, homepage, and product detail
// read directly from this file. Edit names/colours here as needed.

const ASSET = "https://customer-assets.emergentagent.com/job_crescent-admin-fix/artifacts";

export const PRODUCTS = [
  {
    id: "p_polo_textured",
    name: "Textured Polo Tee",
    slug: "textured-polo-tee",
    category: "polo",
    price: 399,
    description:
            "A study in quiet texture. Cut from breathable cotton with a subtly woven surface — understated detail for those who notice.",
    sizes: ["M", "L", "XL"],
    colors: [],
      material: "Jacquard Cotton, textured weave",
    keywords: ["polo", "collared", "buttoned", "textured weave", "regular fit"],
        highlights: {
      sleeve: "Half Sleeve",
            fabric: "100% Cotton Jacquard",
      neck_type: "Polo Neck",
      pattern: "Textured Weave",
    },
    in_stock: true,
    featured: true,
    new_arrival: true,
    images: [],
    variants: [
      {
        id: "polo-c1",
  name: "Dune Beige",
  color_hex: "#C9B493",
  images: ["/dune-beige-1.png", "/dune-beige-2.png", "/dune-beige-3.png", "/dune-beige-4.png"],
  imagesLight: ["/dune-beige-light-1.png", "/dune-beige-light-2.png", "/dune-beige-light-3.png", "/dune-beige-light-4.png"],
  in_stock: true,
      },
      {
        id: "polo-c2",
  name: "Sand Taupe",
  color_hex: "#6D5949",
  images: ["/sand-taupe-1.png", "/sand-taupe-2.png", "/sand-taupe-3.png", "/sand-taupe-4.png"],
  imagesLight: ["/sand-taupe-light-1.png", "/sand-taupe-light-2.png", "/sand-taupe-light-3.png", "/sand-taupe-light-4.png"],
  in_stock: true
      },
      {
        id: "polo-c3",
        name: "Graphite Black",
        color_hex: "#2A2A2D",
        out_of_stock_sizes: ["L"],
        images: ["/polo-c3-1.png", "/polo-c3-2.png", "/polo-c3-3.png", "/polo-c3-4.png"],
        imagesLight: ["/polo-c3-light-1.png", "/polo-c3-light-2.png", "/polo-c3-light-3.png", "/polo-c3-light-4.png"],
        in_stock: true,
      },
      {
        id: "polo-c4",
  name: "Coastal Blue",
  color_hex: "#3A4B6B",
  images: ["/coastal-blue-1.png", "/coastal-blue-2.png", "/coastal-blue-3.png", "/coastal-blue-4.png"],
  imagesLight: ["/coastal-blue-light-1.png", "/coastal-blue-light-2.png", "/coastal-blue-light-3.png", "/coastal-blue-light-4.png"],
  in_stock: true,
      },
      {
        id: "polo-c5",
  name: "Pale Purple",
  color_hex: "#B07F88",
  images: ["/pale-purple-1.png", "/pale-purple-2.png", "/pale-purple-3.png", "/pale-purple-4.png"],
  imagesLight: ["/pale-purple-light-1.png", "/pale-purple-light-2.png", "/pale-purple-light-3.png", "/pale-purple-light-4.png"],
  in_stock: true,
      },
      {
        id: "polo-c6",
  name: "Glacier Grey",
  color_hex: "#B7BCC4",
  images: ["/glacier-grey-1.png", "/glacier-grey-2.png", "/glacier-grey-3.png", "/glacier-grey-4.png"],
  imagesLight: ["/glacier-grey-light-1.png", "/glacier-grey-light-2.png", "/glacier-grey-light-3.png", "/glacier-grey-light-4.png"],
  in_stock: true,
      },
    ],
  },
  {
    id: "p_prism_wear",
    name: "Prism Wear Tee",
    slug: "prism-wear-tee",
    category: "designer",
    price: 349,
    description: "Each piece carries its own story — a unique print, never quite repeated. For those who want their wardrobe to say something, without saying too much.",
    sizes: ["Free Size"],
    colors: [],
    material: "100% Cotton, soft-handle jersey",
    keywords: ["designer", "printed", "graphic", "prism", "artistic", "statement print"],
    highlights: {
      sleeve: "Half Sleeve",
      fabric: "100% Cotton",
      neck_type: "Round Neck",
      pattern: "Printed",
    },
    in_stock: true,
    featured: true,
    new_arrival: true,
    images: [],
    variants: [
      {
  id: "prism-d1",
  name: "Dream",
  color_hex: null,
  images: ["/prism-d1-1.png", "/prism-d1-2.png", "/prism-d1-3.png", "/prism-d1-4.png", "/prism-d1-5.png"],
  imagesLight: ["/prism-d1-light-1.png", "/prism-d1-light-2.png", "/prism-d1-light-3.png", "/prism-d1-light-4.png", "/prism-d1-light-5.png"],
  in_stock: false,
},
      {
  id: "prism-d2",
  name: "Hi Chat",
  color_hex: null,
  images: ["/prism-d2-1.png", "/prism-d2-2.png", "/prism-d2-3.png", "/prism-d2-4.png", "/prism-d2-5.png"],
  imagesLight: ["/prism-d2-light-1.png", "/prism-d2-light-2.png", "/prism-d2-light-3.png", "/prism-d2-light-4.png", "/prism-d2-light-5.png"],
  in_stock: false,
},
      {
  id: "prism-d3",
  name: "Sage Theory Tee",
  color_hex: null,
  images: ["/prism-d3-1.png", "/prism-d3-2.png", "/prism-d3-3.png", "/prism-d3-4.png", "/prism-d3-5.png"],
  imagesLight: ["/prism-d3-light-1.png", "/prism-d3-light-2.png", "/prism-d3-light-3.png", "/prism-d3-light-4.png", "/prism-d3-light-5.png"],
  in_stock: false,
},
      {
  id: "prism-d4",
  name: "Forge",
  color_hex: null,
  images: ["/prism-d4-1.png", "/prism-d4-2.png", "/prism-d4-3.png", "/prism-d4-4.png", "/prism-d4-5.png"],
  imagesLight: ["/prism-d4-light-1.png", "/prism-d4-light-2.png", "/prism-d4-light-3.png", "/prism-d4-light-4.png", "/prism-d4-light-5.png"],
  in_stock: true,
},
      {
  id: "prism-d5",
  name: "Locked",
  color_hex: null,
  images: ["/prism-locked-male-front.png", "/prism-locked-male-side.png", "/prism-locked-male-back.png", "/prism-locked-female-1.png", "/prism-locked-female-2.png"],
  imagesLight: ["/prism-locked-light-male-front.png", "/prism-locked-light-male-side.png", "/prism-locked-light-male-back.png", "/prism-locked-light-female-1.png", "/prism-locked-light-female-2.png"],
  in_stock: true,
},
      {
  id: "prism-d6",
  name: "Artist",
  color_hex: null,
  images: ["/prism-d6-1.png", "/prism-d6-2.png", "/prism-d6-3.png", "/prism-d6-4.png", "/prism-d6-5.png"],
  imagesLight: ["/prism-d6-light-1.png", "/prism-d6-light-2.png", "/prism-d6-light-3.png", "/prism-d6-light-4.png", "/prism-d6-light-5.png"],
  in_stock: true,
},
      {
  id: "prism-d7",
  name: "Login",
  color_hex: null,
  images: ["/prism-d7-1.png", "/prism-d7-2.png", "/prism-d7-3.png", "/prism-d7-4.png", "/prism-d7-5.png"],
  imagesLight: ["/prism-d7-light-1.png", "/prism-d7-light-2.png", "/prism-d7-light-3.png", "/prism-d7-light-4.png", "/prism-d7-light-5.png"],
  in_stock: true,
},
      {
  id: "prism-d9",
  name: "Keep Real",
  color_hex: null,
  images: ["/prism-d9-1.png", "/prism-d9-2.png", "/prism-d9-3.png", "/prism-d9-4.png", "/prism-d9-5.png"],
  imagesLight: ["/prism-d9-light-1.png", "/prism-d9-light-2.png", "/prism-d9-light-3.png", "/prism-d9-light-4.png", "/prism-d9-light-5.png"],
  in_stock: true,
},
      {
  id: "prism-d10",
  name: "Noir Geometry",
  color_hex: null,
  images: ["/prism-d10-1.png", "/prism-d10-2.png", "/prism-d10-3.png", "/prism-d10-4.png", "/prism-d10-5.png"],
  imagesLight: ["/prism-d10-light-1.png", "/prism-d10-light-2.png", "/prism-d10-light-3.png", "/prism-d10-light-4.png", "/prism-d10-light-5.png"],
  in_stock: false,
},
    ],
  },
  {
    id: "p_essential_tee",
    name: "Essential Tee",
    slug: "essential-tee",
    category: "basics",
    price: 299,
    description: "The foundation of a considered wardrobe. Pure cotton, clean lines, no excess — made to be worn often and loved longer.",
    sizes: ["M", "XL"],
    colors: [],
    material: "100% Heavyweight Cotton",
    keywords: ["basic", "plain", "minimal", "everyday", "heavyweight cotton", "solid"],
    highlights: { sleeve: "Half Sleeve", fabric: "100% Cotton", neck_type: "Round Neck", pattern: "Solid" },
    in_stock: true,
    featured: true,
    new_arrival: true,
    images: [],
    variants: [
      {
  id: "ess-c1",
  name: "Urban Black",
  color_hex: "#0B0E1A",
  images: ["/ess-c1-1.png", "/ess-c1-2.png", "/ess-c1-3.png", "/ess-c1-4.png"],
  imagesLight: ["/ess-c1-light-1.png", "/ess-c1-light-2.png", "/ess-c1-light-3.png", "/ess-c1-light-4.png"],
  in_stock: true,
},
{
  id: "ess-c2",
  name: "Pure White",
  color_hex: "#F5F0E8",
  images: ["/ess-c2-1.png", "/ess-c2-2.png", "/ess-c2-3.png", "/ess-c2-4.png"],
  imagesLight: ["/ess-c2-light-1.png", "/ess-c2-light-2.png", "/ess-c2-light-3.png", "/ess-c2-light-4.png"],
  in_stock: true,
},
    ],
  },
];

export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug) || null;

// Returns the theme-appropriate image set for a variant.
// Falls back to the default (dark) images if no light-theme set exists yet.
export const getVariantImages = (variant, theme) => {
  if (!variant) return [];
  if (theme === "light" && variant.imagesLight?.length) return variant.imagesLight;
  return variant.images || [];
};

export const listProducts = ({ category, featured, new_arrival, q } = {}) => {
  let out = [...PRODUCTS];
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
