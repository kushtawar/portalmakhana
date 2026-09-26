import type { PackType } from "@/components/product/PacketArt";
import type { Product } from "@/lib/types";

const MASALA_FLAVOURS = new Set(["Peri Peri", "Pudina Masala", "Cheese & Herb"]);

export function getPackType(product: Product): PackType {
  return product.flavour && MASALA_FLAVOURS.has(product.flavour) ? "masala" : "makhana";
}

// Source of truth: "Shrestha – Website Content & Product Catalogue (Updated Prices)".
// Shrestha is ItarIntakes' product line. Prices are given per kg; pack prices are
// derived from them (Makhana 250 g = per-kg price ÷ 4, spices sold as 1 kg).
const MAKHANA_USES = "Roasted Makhana, Masala Makhana, Chaat, Kheer, fasting recipes, dry-fruit mixes";
const HANDPICKED_NOTE =
  "In the Handpicked option, selected Makhana is manually filtered and sorted — less-suitable pieces are set aside and only the selected Makhana is packed. It is our premium hand-selection option.";
const STOCK = 1000;

function makhana(opts: {
  id: string;
  slug: string;
  name: string;
  grade: string;
  perKg: number;
  sku: string;
  shortDescription: string;
  longDescription: string;
  tagline?: string;
  handpicked: boolean;
  featured?: boolean;
  bestseller?: boolean;
}): Product {
  return {
    id: opts.id,
    slug: opts.slug,
    name: opts.name,
    shortDescription: opts.shortDescription,
    longDescription: opts.longDescription,
    category: "makhana",
    grade: opts.grade,
    gstRate: 5,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: "250 g", price: Math.round(opts.perKg / 4), sku: opts.sku, stock: STOCK },
    ],
    imageLabels: [opts.name],
    imagePath: `/products/${opts.slug}.jpg`,
    featured: opts.featured,
    bestseller: opts.bestseller,
    active: true,
    attributes: [
      { label: "Brand", value: "Shrestha (by ItarIntakes)" },
      { label: "Net weight", value: "250 g" },
      { label: "Price per kg", value: `₹${opts.perKg.toLocaleString("en-IN")}/kg` },
      { label: "Ingredient", value: "Makhana Lava" },
      { label: "Category", value: "Makhana / Fox Nuts" },
      {
        label: "Processing",
        value: opts.handpicked
          ? "Manually filtered / selected & packed"
          : "Machine-prepared & packed",
      },
      { label: "Packaging", value: "Hygienically packed" },
      { label: "Uses", value: MAKHANA_USES },
      ...(opts.tagline ? [{ label: "Tagline", value: opts.tagline }] : []),
    ],
  };
}

function spice(opts: { id: string; slug: string; name: string; sku: string; shortDescription: string }): Product {
  return {
    id: opts.id,
    slug: opts.slug,
    name: opts.name,
    shortDescription: opts.shortDescription,
    longDescription:
      "Shrestha's spice range brings essential powdered spices for everyday Indian cooking. Every Indian kitchen needs a few basic spices — Shrestha Haldi, Dhaniya and Mircha are simple, useful spice essentials for everyday cooking.",
    category: "spice",
    gstRate: 5,
    priceIncludesTax: true,
    variants: [{ id: "v1", label: "1 kg", price: 400, sku: opts.sku, stock: STOCK }],
    imageLabels: [opts.name],
    imagePath: `/products/${opts.slug}.jpg`,
    active: true,
    attributes: [
      { label: "Brand", value: "Shrestha (by ItarIntakes)" },
      { label: "Price per kg", value: "₹400/kg" },
      { label: "Type", value: "Powdered spice" },
    ],
  };
}

export const products: Product[] = [
  makhana({
    id: "p1",
    slug: "shrestha-silver-makhana",
    name: "Shrestha Silver Makhana",
    grade: "Silver",
    perKg: 900,
    sku: "SHR-SLV-250",
    shortDescription: "Everyday Makhana, Shrestha quality — simple, delicious and versatile.",
    longDescription:
      "Silver Makhana is our everyday Makhana, prepared and sorted with processing machinery and then hygienically packed. Light and crunchy, it works for roasted or masala Makhana, chaat, kheer, fasting recipes and dry-fruit mixes.",
    tagline: "Simple. Delicious. Versatile.",
    handpicked: false,
    featured: true,
  }),
  makhana({
    id: "p2",
    slug: "shrestha-gold-makhana",
    name: "Shrestha Gold Makhana",
    grade: "Gold",
    perKg: 1000,
    sku: "SHR-GLD-250",
    shortDescription: "Carefully selected, delicious and versatile Makhana.",
    longDescription:
      "Gold Makhana is carefully selected, machine-prepared and hygienically packed. A great all-rounder for roasted or masala Makhana, chaat, kheer, fasting recipes and dry-fruit mixes.",
    tagline: "Selected Makhana. Great Taste. Shrestha Quality.",
    handpicked: false,
    featured: true,
    bestseller: true,
  }),
  makhana({
    id: "p3",
    slug: "shrestha-handpicked-gold-makhana",
    name: "Shrestha Handpicked Gold Makhana",
    grade: "Gold (Handpicked)",
    perKg: 1100,
    sku: "SHR-GLD-HP-250",
    shortDescription: "Gold Makhana, manually filtered and selected — our premium hand-selection option.",
    longDescription: `Handpicked Gold is the premium option in our Gold range. ${HANDPICKED_NOTE}`,
    tagline: "Selected Makhana. Great Taste. Shrestha Quality.",
    handpicked: true,
  }),
  makhana({
    id: "p4",
    slug: "shrestha-diamond-makhana",
    name: "Shrestha Diamond Makhana",
    grade: "Diamond",
    perKg: 1300,
    sku: "SHR-DMD-250",
    shortDescription: "A premium Makhana experience — premium selection, authentic taste.",
    longDescription:
      "Diamond Makhana is our premium Makhana, machine-prepared and hygienically packed. Enjoy it roasted or as masala Makhana, in chaat, kheer, fasting recipes and dry-fruit mixes.",
    tagline: "Premium Selection. Authentic Taste. Shrestha Quality.",
    handpicked: false,
    featured: true,
    bestseller: true,
  }),
  makhana({
    id: "p5",
    slug: "shrestha-handpicked-diamond-makhana",
    name: "Shrestha Handpicked Diamond Makhana",
    grade: "Diamond (Handpicked)",
    perKg: 1400,
    sku: "SHR-DMD-HP-250",
    shortDescription: "Diamond Makhana, manually filtered and selected — our top hand-selection option.",
    longDescription: `Handpicked Diamond is the premium option in our Diamond range. ${HANDPICKED_NOTE}`,
    tagline: "Premium Selection. Authentic Taste. Shrestha Quality.",
    handpicked: true,
    featured: true,
  }),
  spice({
    id: "p6",
    slug: "shrestha-haldi-powder",
    name: "Shrestha Haldi Powder",
    sku: "SHR-HLD-1000",
    shortDescription: "Everyday haldi (turmeric) powder for Indian cooking.",
  }),
  spice({
    id: "p7",
    slug: "shrestha-dhaniya-powder",
    name: "Shrestha Dhaniya Powder",
    sku: "SHR-DHN-1000",
    shortDescription: "Everyday dhaniya (coriander) powder for Indian cooking.",
  }),
  spice({
    id: "p8",
    slug: "shrestha-mircha-powder",
    name: "Shrestha Mircha (Laal Mirch) Powder",
    sku: "SHR-MRC-1000",
    shortDescription: "Everyday laal mirch (red chilli) powder for Indian cooking.",
  }),
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
