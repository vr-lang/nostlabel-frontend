export interface ProductVariant {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  gsm: string;
  price: number;
  discountPrice?: number;
  colors: string[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  images: string[];
  variants: ProductVariant[];
  category: string;
  featured?: boolean;
  bestseller?: boolean;
}

export const HERO_PRODUCTS: Product[] = [
  {
    id: "6660f5b248a32b23a5e8f001",
    name: "Oversized Signature Tee",
    slug: "oversized-signature-tee",
    description: "Engineered with a heavy drop-shoulder silhouette, tight collar ribbing, and double-needle construction. Built from organic long-staple cotton for a structured drape.",
    material: "100% Organic Cotton",
    gsm: "280 GSM Heavyweight Rib",
    price: 1499,
    discountPrice: 1199,
    colors: ["Charcoal", "Off-White", "Sage"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Oversized T-Shirts",
    featured: true,
    bestseller: true,
    variants: [
      { size: "S", color: "Charcoal", stock: 20, sku: "NST-TEE-S-CHA" },
      { size: "M", color: "Charcoal", stock: 45, sku: "NST-TEE-M-CHA" },
      { size: "L", color: "Charcoal", stock: 50, sku: "NST-TEE-L-CHA" },
      { size: "XL", color: "Charcoal", stock: 30, sku: "NST-TEE-XL-CHA" },
      { size: "S", color: "Off-White", stock: 15, sku: "NST-TEE-S-WHT" },
      { size: "M", color: "Off-White", stock: 35, sku: "NST-TEE-M-WHT" },
      { size: "L", color: "Off-White", stock: 40, sku: "NST-TEE-L-WHT" },
      { size: "XL", color: "Off-White", stock: 25, sku: "NST-TEE-XL-WHT" }
    ]
  },
  {
    id: "6660f5b248a32b23a5e8f002",
    name: "Heavyweight Boxy Hoodie",
    slug: "heavyweight-boxy-hoodie",
    description: "Architectural proportions meet daily comfort. Double-lined crossover hood without drawstrings, kangaroo pouch pocket, and tight elasticated cuffs. Heavy loopback fleece finish.",
    material: "100% Cotton Fleece",
    gsm: "450 GSM Custom Loopback",
    price: 3499,
    discountPrice: 2999,
    colors: ["Ash Black", "Sand", "Slate Blue"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Hoodies",
    featured: true,
    bestseller: true,
    variants: [
      { size: "S", color: "Ash Black", stock: 15, sku: "NST-HDD-S-BLK" },
      { size: "M", color: "Ash Black", stock: 30, sku: "NST-HDD-M-BLK" },
      { size: "L", color: "Ash Black", stock: 30, sku: "NST-HDD-L-BLK" },
      { size: "XL", color: "Ash Black", stock: 15, sku: "NST-HDD-XL-BLK" },
      { size: "M", color: "Sand", stock: 25, sku: "NST-HDD-M-SND" },
      { size: "L", color: "Sand", stock: 25, sku: "NST-HDD-L-SND" }
    ]
  },
  {
    id: "6660f5b248a32b23a5e8f003",
    name: "Architectural Cargo Pants",
    slug: "architectural-cargo-pants",
    description: "Relaxed-fit straight-leg cargo trouser crafted in thick cotton canvas. Features custom metal rivets, detailed knee articulation panels, and 3D cargo pockets.",
    material: "100% Double-Weave Cotton Canvas",
    gsm: "380 GSM Technical Canvas",
    price: 2799,
    discountPrice: 2499,
    colors: ["Olive", "Obsidian Black"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Essentials",
    featured: true,
    variants: [
      { size: "S", color: "Olive", stock: 10, sku: "NST-CRG-S-OLV" },
      { size: "M", color: "Olive", stock: 20, sku: "NST-CRG-M-OLV" },
      { size: "L", color: "Olive", stock: 20, sku: "NST-CRG-L-OLV" },
      { size: "M", color: "Obsidian Black", stock: 15, sku: "NST-CRG-M-BLK" },
      { size: "L", color: "Obsidian Black", stock: 15, sku: "NST-CRG-L-BLK" }
    ]
  },
  {
    id: "6660f5b248a32b23a5e8f004",
    name: "Modular Utility Jacket",
    slug: "modular-utility-jacket",
    description: "Constructed with technical water-repellent shell fabric. Double-ended zip closure, structured funnel neck, and magnetic flap utility pockets. Ideal for modular winter layering.",
    material: "Nylon Shell & Mesh Lining",
    gsm: "220 GSM Technical Shell",
    price: 4599,
    discountPrice: 3999,
    colors: ["Steel Grey", "Dark Sand"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Limited Drops",
    featured: true,
    variants: [
      { size: "S", color: "Steel Grey", stock: 8, sku: "NST-JKT-S-GRY" },
      { size: "M", color: "Steel Grey", stock: 12, sku: "NST-JKT-M-GRY" },
      { size: "L", color: "Steel Grey", stock: 15, sku: "NST-JKT-L-GRY" },
      { size: "XL", color: "Steel Grey", stock: 10, sku: "NST-JKT-XL-GRY" }
    ]
  }
];

export const ALL_PRODUCTS: Product[] = [
  ...HERO_PRODUCTS,
  {
    id: "6660f5b248a32b23a5e8f005",
    name: "Minimalist Mockneck Sweatshirt",
    slug: "minimalist-mockneck-sweatshirt",
    description: "Double knit technical ribbing at collar, drop sleeve seams, brushed internal fleece. Clean, understated silhouette.",
    material: "85% Cotton, 15% Polyester",
    gsm: "400 GSM Heavy Fleece",
    price: 2999,
    colors: ["Off-White", "Midnight Navy"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Essentials",
    bestseller: true,
    variants: [
      { size: "S", color: "Off-White", stock: 10, sku: "NST-MCK-S-WHT" },
      { size: "M", color: "Off-White", stock: 15, sku: "NST-MCK-M-WHT" },
      { size: "L", color: "Off-White", stock: 15, sku: "NST-MCK-L-WHT" },
      { size: "M", color: "Midnight Navy", stock: 20, sku: "NST-MCK-M-NVY" }
    ]
  },
  {
    id: "6660f5b248a32b23a5e8f006",
    name: "Classic Relaxed Linen Shirt",
    slug: "classic-relaxed-linen-shirt",
    description: "Premium French linen woven for ultimate breathability. Spread collar, French placket, and single box pleat at the back yoke.",
    material: "100% French Linen",
    gsm: "160 GSM Linen",
    price: 1999,
    colors: ["Ecru", "Pure White"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Shirts",
    bestseller: true,
    variants: [
      { size: "S", color: "Ecru", stock: 15, sku: "NST-LIN-S-ECR" },
      { size: "M", color: "Ecru", stock: 25, sku: "NST-LIN-M-ECR" },
      { size: "L", color: "Ecru", stock: 25, sku: "NST-LIN-L-ECR" },
      { size: "M", color: "Pure White", stock: 20, sku: "NST-LIN-M-WHT" }
    ]
  },
  {
    id: "6660f5b248a32b23a5e8f007",
    name: "Raw Selvedge Denim Jacket",
    slug: "raw-selvedge-denim-jacket",
    description: "Unwashed 14oz Japanese selvedge denim. Over time, it conforms to your movements, creating unique wear patterns. Custom branded brass hardware.",
    material: "100% Japanese Selvedge Cotton",
    gsm: "14 oz Heavyweight Denim",
    price: 4999,
    colors: ["Raw Indigo"],
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Limited Drops",
    variants: [
      { size: "M", color: "Raw Indigo", stock: 8, sku: "NST-DNM-M-IND" },
      { size: "L", color: "Raw Indigo", stock: 12, sku: "NST-DNM-L-IND" },
      { size: "XL", color: "Raw Indigo", stock: 6, sku: "NST-DNM-XL-IND" }
    ]
  },
  {
    id: "6660f5b248a32b23a5e8f008",
    name: "Architectural Heavy Knit Tee",
    slug: "architectural-heavy-knit-tee",
    description: "Structured luxury knitwear with ribbed detailing. A heavy drape that keeps its shape throughout the day.",
    material: "80% Cotton, 20% Silk Blend",
    gsm: "320 GSM Premium Knit",
    price: 1899,
    colors: ["Oatmeal", "Slate"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1000"
    ],
    category: "Oversized T-Shirts",
    bestseller: true,
    variants: [
      { size: "S", color: "Oatmeal", stock: 10, sku: "NST-KNT-S-OAT" },
      { size: "M", color: "Oatmeal", stock: 20, sku: "NST-KNT-M-OAT" },
      { size: "L", color: "Oatmeal", stock: 20, sku: "NST-KNT-L-OAT" },
      { size: "M", color: "Slate", stock: 15, sku: "NST-KNT-M-SLT" }
    ]
  }
];
