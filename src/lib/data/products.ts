import type { PackType } from "@/components/product/PacketArt";
import type { Product } from "@/lib/types";

const MASALA_FLAVOURS = new Set(["Peri Peri", "Pudina Masala", "Cheese & Herb"]);

export function getPackType(product: Product): PackType {
  return product.flavour && MASALA_FLAVOURS.has(product.flavour) ? "masala" : "makhana";
}

export const products: Product[] = [
  {
    id: "p1",
    slug: "classic-roasted-makhana",
    name: "Classic Roasted Makhana",
    shortDescription: "Lightly salted, air-roasted fox nuts with a clean, crunchy bite.",
    longDescription:
      "Our signature roasted Makhana, made from premium fox nuts sourced from Patna and air-roasted with a light touch of rock salt. No added oil, no artificial flavouring — just the natural crunch our family has been perfecting for over a decade.",
    category: "roasted",
    grade: "Suta",
    flavour: "Lightly Salted",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "100g", price: 149, sku: "ITK-CRM-100", stock: 42 },
      { id: "v2", label: "200g", price: 269, compareAtPrice: 299, sku: "ITK-CRM-200", stock: 30 },
      { id: "v3", label: "500g", price: 599, sku: "ITK-CRM-500", stock: 12 },
    ],
    imageLabels: ["Classic Roasted"],
    featured: true,
    bestseller: true,
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Shelf life", value: "6 months" },
      { label: "Packaging", value: "Resealable pack" },
    ],
  },
  {
    id: "p2",
    slug: "peri-peri-roasted-makhana",
    name: "Peri Peri Roasted Makhana",
    shortDescription: "A tangy, spiced twist on our classic roast for snack lovers.",
    longDescription:
      "Premium fox nuts roasted and tossed in a peri peri seasoning blend — tangy, mildly spicy and completely addictive. A popular pick for evening snacking and get-togethers.",
    category: "flavoured",
    grade: "Suta",
    flavour: "Peri Peri",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "100g", price: 159, sku: "ITK-PPM-100", stock: 38 },
      { id: "v2", label: "200g", price: 289, sku: "ITK-PPM-200", stock: 22 },
    ],
    imageLabels: ["Peri Peri"],
    featured: true,
    bestseller: true,
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Shelf life", value: "6 months" },
      { label: "Spice level", value: "Medium" },
    ],
  },
  {
    id: "p3",
    slug: "pudina-masala-makhana",
    name: "Pudina Masala Makhana",
    shortDescription: "Roasted fox nuts with a refreshing mint-masala seasoning.",
    longDescription:
      "A cooling pudina masala blend over crunchy roasted Makhana — a favourite for anyone who likes their snacks with a herby kick.",
    category: "flavoured",
    grade: "Suta",
    flavour: "Pudina Masala",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "100g", price: 159, sku: "ITK-PMM-100", stock: 25 },
      { id: "v2", label: "200g", price: 289, sku: "ITK-PMM-200", stock: 18 },
    ],
    imageLabels: ["Pudina Masala"],
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Shelf life", value: "6 months" },
    ],
  },
  {
    id: "p4",
    slug: "himalayan-pink-salt-makhana",
    name: "Himalayan Pink Salt Makhana",
    shortDescription: "A minimal, mineral-rich take on our classic roast.",
    longDescription:
      "For customers who prefer a purer snack, this variant uses Himalayan pink salt instead of regular rock salt — same premium fox nuts, same careful roast.",
    category: "roasted",
    grade: "Suta",
    flavour: "Himalayan Pink Salt",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "100g", price: 169, sku: "ITK-HPS-100", stock: 20 },
      { id: "v2", label: "200g", price: 309, sku: "ITK-HPS-200", stock: 15 },
    ],
    imageLabels: ["Himalayan Pink Salt"],
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Shelf life", value: "6 months" },
    ],
  },
  {
    id: "p5",
    slug: "cheese-and-herb-makhana",
    name: "Cheese & Herb Makhana",
    shortDescription: "A savoury, herby cheese seasoning over roasted fox nuts.",
    longDescription:
      "A customer favourite for kids and adults alike — roasted Makhana finished with a savoury cheese and herb seasoning blend.",
    category: "flavoured",
    grade: "Suta",
    flavour: "Cheese & Herb",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "100g", price: 169, sku: "ITK-CHM-100", stock: 28 },
      { id: "v2", label: "200g", price: 309, sku: "ITK-CHM-200", stock: 20 },
    ],
    imageLabels: ["Cheese & Herb"],
    bestseller: true,
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Shelf life", value: "6 months" },
    ],
  },
  {
    id: "p6",
    slug: "raw-premium-makhana",
    name: "Raw Premium Makhana (Suta Grade)",
    shortDescription: "Unroasted, top-grade fox nuts for cooking, kheer and roasting at home.",
    longDescription:
      "Top Suta-grade raw Makhana, hand-sorted for size and quality — ideal for home roasting, kheer, curries and festive preparations. This is the same grade we supply to our wholesale and export partners.",
    category: "raw",
    grade: "Suta",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "250g", price: 249, sku: "ITK-RAW-250", stock: 50 },
      { id: "v2", label: "500g", price: 469, sku: "ITK-RAW-500", stock: 35 },
      { id: "v3", label: "1kg", price: 899, sku: "ITK-RAW-1000", stock: 20 },
    ],
    imageLabels: ["Raw Premium"],
    featured: true,
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Use case", value: "Cooking, roasting, kheer" },
      { label: "Shelf life", value: "9 months" },
    ],
  },
  {
    id: "p7",
    slug: "chocolate-coated-makhana",
    name: "Chocolate Coated Makhana",
    shortDescription: "Roasted fox nuts dipped in a thin layer of chocolate.",
    longDescription:
      "A guilt-lighter indulgence — crunchy roasted Makhana coated in a thin layer of chocolate. A popular festive and gifting choice.",
    category: "flavoured",
    grade: "Suta",
    flavour: "Chocolate",
    gstRate: 12,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "150g", price: 249, sku: "ITK-CCM-150", stock: 16 },
    ],
    imageLabels: ["Chocolate Coated"],
    active: true,
    attributes: [
      { label: "Grade", value: "Suta" },
      { label: "Shelf life", value: "4 months" },
      { label: "Storage", value: "Cool, dry place" },
    ],
  },
  {
    id: "p8",
    slug: "festive-gift-box-assorted-makhana",
    name: "Festive Gift Box — Assorted Makhana",
    shortDescription: "A curated gift box of our bestselling Makhana flavours.",
    longDescription:
      "A premium gift box featuring four of our bestselling Makhana flavours in a festive parrot-green presentation box — a popular choice for corporate gifting and festive hampers.",
    category: "gift-pack",
    grade: "Suta",
    gstRate: 12,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "4 x 100g Box", price: 699, compareAtPrice: 799, sku: "ITK-GFT-400", stock: 24 },
    ],
    imageLabels: ["Festive Gift Box"],
    featured: true,
    active: true,
    attributes: [
      { label: "Contents", value: "4 assorted 100g packs" },
      { label: "Shelf life", value: "6 months" },
      { label: "Ideal for", value: "Gifting, festive hampers" },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((candidate) => candidate.slug !== product.slug && candidate.active)
    .filter((candidate) => candidate.category === product.category)
    .slice(0, limit)
    .concat(
      products.filter(
        (candidate) =>
          candidate.slug !== product.slug &&
          candidate.active &&
          candidate.category !== product.category
      )
    )
    .slice(0, limit);
}
