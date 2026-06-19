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
      material: "100% Cotton, textured weave",
    keywords: ["polo", "collared", "buttoned", "textured weave", "regular fit"],
    highlights: {
      sleeve: "Half Sleeve",
      fabric: "100% Cotton",
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
        images: [
          `${ASSET}/n405oqrl_beige%201.png`,
          "/dune-beige-side.png",
          "/dune-beige-back.png",
        ],
        in_stock: true,
      },
      {
        id: "polo-c2",
        name: "Sand Taupe",
        color_hex: "#6D5949",
        images: [
          `${ASSET}/nzyt7qnw_dark%20beige%201%20.png`,
          "/polo-c2-2.png",
          "/polo-c2-3.png",
        ],
        in_stock: true,
      },
      {
        id: "polo-c3",
        name: "Graphite Black",
        color_hex: "#2A2A2D",
        out_of_stock_sizes: ["L"],
        images: [
          `${ASSET}/u53soazb_dark%20grey%201.png`,
          "/polo-c3-2.png",
          "/polo-c3-3.png",
        ],
        in_stock: true,
      },
      {
        id: "polo-c4",
        name: "Coastal Blue",
        color_hex: "#3A4B6B",
        images: [
          `${ASSET}/5j7gdl06_royal%20blue%201.png`,
          "/polo-c4-2.png",
          "/polo-c4-3.png",
        ],
        in_stock: true,
      },
      {
        id: "polo-c5",
        name: "Pale Purple",
        color_hex: "#B07F88",
        images: [
          `${ASSET}/y2nkbyds_rust%201.png`,
          "/polo-c5-2.png",
          "/polo-c5-3.png",
        ],
        in_stock: true,
      },
      {
        id: "polo-c6",
        name: "Glacier Grey",
        color_hex: "#B7BCC4",
        images: [
          `${ASSET}/7jdbs4k3_grey%202.png`,
          "/polo-c6-2.png",
          "/polo-c6-3.png",
        ],
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
    description:
      "Each piece carries its own story — a unique print, never quite repeated. For those who want their wardrobe to say something, without saying too much.",
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
        name: "Design 01",
        color_hex: null,
        images: [
          `${ASSET}/q8uaai9p_desigenr%20beige%201%20.png`,
          "/prism-d1-2.png",
          "/prism-d1-3.png",
        ],
        in_stock: false,
      },
      {
        id: "prism-d2",
        name: "Design 02",
        color_hex: null,
        images: [
          `${ASSET}/pkr2srcb_black%20designer%201.png`,
          "/prism-d2-2.png",
          "/prism-d2-3.png",
        ],
        in_stock: false,
      },
      {
        id: "prism-d3",
        name: "Design 03",
        color_hex: null,
        images: [
          `${ASSET}/r8hotwwk_designer%20green%201.png`,
          "/prism-d3-2.png",
          "/prism-d3-3.png",
        ],
        in_stock: true,
      },
      {
        id: "prism-d4",
        name: "Design 04",
        color_hex: null,
        images: [
          `${ASSET}/cmovrhje_23.png`,
          "/prism-d4-2.png",
          "/prism-d4-3.png",
        ],
        in_stock: true,
      },
      {
        id: "prism-d5",
        name: "Design 05",
        color_hex: null,
        images: [
          `${ASSET}/aeyorgt4_three%201.png`,
          "/prism-d5-2.png",
          "/prism-d5-3.png",
        ],
        in_stock: true,
      },
      {
        id: "prism-d6",
        name: "Design 06",
        color_hex: null,
        images: [
          `${ASSET}/uwlyo46l_designer%20pink%201%20.png`,
          "/prism-d6-2.png",
          "/prism-d6-3.png",
        ],
        in_stock: false,
      },
      {
        id: "prism-d7",
        name: "Design 07",
        color_hex: null,
        images: [
          `${ASSET}/jqs8nqld_pink%20designer%202nd.png`,
          "/prism-d7-2.png",
          "/prism-d7-3.png",
        ],
        in_stock: false,
      },
      {
        id: "prism-d8",
        name: "Design 08",
        color_hex: null,
        images: [
          `${ASSET}/0b4hx354_ChatGPT%20Image%20Jun%204%2C%202026%2C%2008_43_55%20PM.png`,
          "/prism-d8-2.png",
          "/prism-d8-3.png",
        ],
        in_stock: true,
      },
      {
        id: "prism-d9",
        name: "Design 09",
        color_hex: null,
        images: [
          `${ASSET}/7azinc4k_ChatGPT%20Image%20Jun%204%2C%202026%2C%2008_43_46%20PM.png`,
          "/prism-d9-2.png",
          "/prism-d9-3.png",
        ],
        in_stock: true,
      },
      {
        id: "prism-d10",
        name: "Design 10",
        color_hex: null,
        images: [
          `${ASSET}/sel429md_ChatGPT%20Image%20Jun%204%2C%202026%2C%2008_43_36%20PM.png`,
          "/prism-d10-2.png",
          "/prism-d10-3.png",
        ],
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
    description:
       "The foundation of a considered wardrobe. Pure cotton, clean lines, no excess — made to be worn often and loved longer.",
    sizes: ["M", "XL"],
    colors: [],
    material: "100% Heavyweight Cotton",
    keywords: ["basic", "plain", "minimal", "everyday", "heavyweight cotton", "solid"],
    highlights: {
      sleeve: "Half Sleeve",
      fabric: "100% Cotton",
      neck_type: "Round Neck",
      pattern: "Solid",
    },
    in_stock: true,
    featured: true,
    new_arrival: true,
    images: [],
    variants: [
      {
        id: "ess-c1",
        name: "Urban Black",
        color_hex: "#0B0E1A",
        images: [
          `${ASSET}/ey3vcjrh_plain%20black%201%20.png`,
          "/ess-c1-2.png",
          "/ess-c1-3.png",
        ],
        in_stock: true,
      },
      {
        id: "ess-c2",
        name: "Pure White",
        color_hex: "#F5F0E8",
        images: [
          `${ASSET}/c3331ol8_plain%20white%201.png`,
          "/ess-c2-2.png",
          "/ess-c2-3.png",
        ],
        in_stock: true,
      },
    ],
  },
];

export const getProductBySlug = (slug) =>
  PRODUCTS.find((p) => p.slug === slug) || null;

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
      (p.keywords || []).some((k) => k.toLowerCase().includes(s))
    );
  }
  return out;
};
