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
  /** "Selection" column from the Shrestha Makhana product-descriptions document. */
  selection: string;
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
      { label: "Selection", value: opts.selection },
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
    name: "Silver Makhana",
    grade: "Silver",
    perKg: 900,
    sku: "SHR-SLV-250",
    shortDescription:
      "Our regular graded makhana — good quality for everyday snacking and cooking.",
    longDescription:
      "Shrestha Silver Makhana is our regular graded makhana option, offering good quality for everyday use. It generally contains comparatively smaller and more mixed-size kernels than the higher Gold and Diamond grades, making it a practical choice for families who want makhana as part of their regular snack or cooking routine. Roast and season it to your taste, or use it in homemade recipes such as makhana curry, kheer and other preparations. Our grading process separates makhana into different quality and size categories before packing; the final size mix can vary naturally with the agricultural harvest. Silver offers an accessible way to enjoy makhana while retaining its characteristic light and crunchy nature when roasted.",
    tagline: "Simple. Delicious. Versatile.",
    selection: "Regular graded selection",
    featured: true,
  }),
  makhana({
    id: "p2",
    slug: "shrestha-gold-makhana",
    name: "Gold Makhana",
    grade: "Gold",
    perKg: 1000,
    sku: "SHR-GLD-250",
    shortDescription:
      "Premium-grade makhana — generally larger, fuller and more uniform than Silver.",
    longDescription:
      "Shrestha Gold Makhana is a premium-grade makhana selected for its fuller appearance and better size profile. It is generally larger and more uniform than the regular Silver grade, and the kernels are carefully graded to offer a satisfying combination of size, appearance and texture. Gold is a great choice for a premium everyday makhana experience — enjoy it roasted, lightly seasoned or in a variety of homemade recipes. The Gold range suits everyday snacking as well as premium presentation. For additional manual selection, Gold is also available as Handpicked Gold.",
    tagline: "Selected Makhana. Great Taste. Shrestha Quality.",
    selection: "Premium graded selection",
    featured: true,
    bestseller: true,
  }),
  makhana({
    id: "p3",
    slug: "shrestha-handpicked-gold-makhana",
    name: "Handpicked Gold Makhana",
    grade: "Gold (Handpicked)",
    perKg: 1100,
    sku: "SHR-GLD-HP-250",
    shortDescription:
      "Gold Makhana, manually filtered and selected before packing for an extra level of sorting.",
    longDescription:
      "Handpicked Gold is our premium-grade Gold Makhana with an extra level of sorting: the makhana is manually filtered and selected before packing, rather than relying only on machine-based grading. Like Gold, it is selected for a fuller appearance and better size profile — generally larger and more uniform than Silver. It is ideal for customers who prefer more manual sorting and selection, for everyday snacking as well as premium presentation.",
    tagline: "Selected Makhana. Great Taste. Shrestha Quality.",
    selection: "Manually filtered",
    featured: true,
    bestseller: true,
  }),
  makhana({
    id: "p4",
    slug: "shrestha-diamond-makhana",
    name: "Diamond Makhana",
    grade: "Diamond",
    perKg: 1300,
    sku: "SHR-DMD-250",
    shortDescription:
      "Our top premium grade — larger, fuller makhana carefully graded for a premium selection.",
    longDescription:
      "Shrestha Diamond Makhana is our top premium grade, selected for a larger and fuller appearance. It is generally the largest and most premium-looking grade among our Silver, Gold and Diamond range, with kernels carefully graded for customers who prefer larger makhana. Diamond is ideal for premium snacking, special occasions and anyone seeking a higher-grade selection — roast it, season it, or use it in traditional and modern makhana recipes. The exact size may vary naturally from harvest to harvest, while the grade is maintained through selection. Diamond is also available in a Handpicked version.",
    tagline: "Premium Selection. Authentic Taste. Shrestha Quality.",
    selection: "Top premium graded selection",
    featured: true,
    bestseller: true,
  }),
  makhana({
    id: "p5",
    slug: "shrestha-handpicked-diamond-makhana",
    name: "Handpicked Diamond Makhana",
    grade: "Diamond (Handpicked)",
    perKg: 1400,
    sku: "SHR-DMD-HP-250",
    shortDescription:
      "Our top premium Diamond grade, manually filtered and selected before packing.",
    longDescription:
      "Handpicked Diamond is our top premium Diamond grade with an extra stage of human sorting: the makhana is manually filtered and selected before packing, rather than relying only on machine-based grading. Like Diamond, it is selected for a larger and fuller appearance — ideal for premium snacking, special occasions and customers who prefer additional manual selection.",
    tagline: "Premium Selection. Authentic Taste. Shrestha Quality.",
    selection: "Manually filtered",
    featured: true,
  }),
  spice({
    id: "p6",
    slug: "shrestha-haldi-powder",
    name: "Haldi Powder",
    sku: "SHR-HLD-1000",
    shortDescription: "Everyday haldi (turmeric) powder for Indian cooking.",
  }),
  spice({
    id: "p7",
    slug: "shrestha-dhaniya-powder",
    name: "Dhaniya Powder",
    sku: "SHR-DHN-1000",
    shortDescription: "Everyday dhaniya (coriander) powder for Indian cooking.",
  }),
  spice({
    id: "p8",
    slug: "shrestha-mircha-powder",
    name: "Laal Mirch Powder",
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
