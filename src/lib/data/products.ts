import type { PackType } from "@/components/product/PacketArt";
import type { Product } from "@/lib/types";

const MASALA_FLAVOURS = new Set(["Peri Peri", "Pudina Masala", "Cheese & Herb"]);

export function getPackType(product: Product): PackType {
  return product.flavour && MASALA_FLAVOURS.has(product.flavour) ? "masala" : "makhana";
}

// Names, pack weights and rates per kg: the business's product catalogue (13 products).
// Descriptions: "Shrestha – Website Content & Product Catalogue" and the Shrestha Makhana
// product-descriptions document. Shrestha is PatnaMakhana's product line.
// Pack price = rate per kg × pack weight, rounded to the nearest rupee.
const MAKHANA_USES = "Roasted Makhana, Masala Makhana, Chaat, Kheer, fasting recipes, dry-fruit mixes";
const STOCK = 1000;

/**
 * PROVISIONAL total GST (%) for the six products added in the 13-product catalogue update
 * (Khada Garam Masala, Jeera Powder, both cashews, Camphor, Tea Leaves). The business has
 * not yet confirmed their tax rates — confirm each before treating it as a final tax
 * setting. The app stores one combined rate (gstRate), not separate CGST/SGST.
 */
export const PROVISIONAL_GST_RATE = 5;

const packPrice = (perKg: number, grams: number) => Math.round((perKg * grams) / 1000);
const perKgLabel = (perKg: number) => `₹${perKg.toLocaleString("en-IN")}/kg`;

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
      { id: "v1", label: "250 g", price: packPrice(opts.perKg, 250), sku: opts.sku, stock: STOCK },
    ],
    imageLabels: [opts.name],
    imagePath: `/products/${opts.slug}-v2.jpg`,
    featured: opts.featured,
    bestseller: opts.bestseller,
    active: true,
    attributes: [
      { label: "Brand", value: "Shrestha (by PatnaMakhana)" },
      { label: "Net weight", value: "250 g" },
      { label: "Price per kg", value: perKgLabel(opts.perKg) },
      { label: "Ingredient", value: "Makhana Lava" },
      { label: "Category", value: "Makhana / Fox Nuts" },
      { label: "Selection", value: opts.selection },
      { label: "Packaging", value: "Hygienically packed" },
      { label: "Uses", value: MAKHANA_USES },
      ...(opts.tagline ? [{ label: "Tagline", value: opts.tagline }] : []),
    ],
  };
}

/** Non-makhana products: one pack size, priced from the rate per kg. */
function packed(opts: {
  id: string;
  slug: string;
  name: string;
  category: Product["category"];
  grams: number;
  perKg: number;
  sku: string;
  type: string;
  /** Total GST %. */
  gstRate: number;
  shortDescription: string;
  longDescription: string;
  /** Existing photo; new products without one get a placeholder to replace in the admin. */
  imagePath?: string;
}): Product {
  const weight = `${opts.grams} g`;
  return {
    id: opts.id,
    slug: opts.slug,
    name: opts.name,
    shortDescription: opts.shortDescription,
    longDescription: opts.longDescription,
    category: opts.category,
    gstRate: opts.gstRate,
    priceIncludesTax: true,
    variants: [
      { id: "v1", label: weight, price: packPrice(opts.perKg, opts.grams), sku: opts.sku, stock: STOCK },
    ],
    imageLabels: [opts.name],
    imagePath: opts.imagePath ?? `/products/placeholders/${opts.slug}.jpg`,
    active: true,
    attributes: [
      { label: "Brand", value: "Shrestha (by PatnaMakhana)" },
      { label: "Net weight", value: weight },
      { label: "Price per kg", value: perKgLabel(opts.perKg) },
      { label: "Type", value: opts.type },
    ],
  };
}

const SPICE_DESCRIPTION =
  "Shrestha's spice range brings essential spices for everyday Indian cooking — simple, useful kitchen staples, hygienically packed.";

export const products: Product[] = [
  makhana({
    id: "p4",
    slug: "shrestha-diamond-makhana",
    name: "Makhana Diamond (6 Suta)",
    grade: "Diamond (6 Suta)",
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
    id: "p2",
    slug: "shrestha-gold-makhana",
    name: "Makhana Gold (5 Suta)",
    grade: "Gold (5 Suta)",
    perKg: 940,
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
    id: "p1",
    slug: "shrestha-silver-makhana",
    name: "Makhana Silver (4 Suta)",
    grade: "Silver (4 Suta)",
    perKg: 800,
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
    id: "p3",
    slug: "shrestha-handpicked-gold-makhana",
    name: "Makhana Hand Picked Gold",
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
    id: "p5",
    slug: "shrestha-handpicked-diamond-makhana",
    name: "Makhana Hand Picked Diamond",
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
  packed({
    id: "p6",
    slug: "shrestha-khada-garam-masala",
    name: "Khada Garam Masala",
    category: "spice",
    grams: 100,
    perKg: 1500,
    sku: "SHR-KGM-100",
    type: "Whole spice blend",
    gstRate: PROVISIONAL_GST_RATE,
    shortDescription: "Whole garam masala spices for everyday Indian cooking.",
    longDescription: SPICE_DESCRIPTION,
  }),
  packed({
    id: "p7",
    slug: "shrestha-haldi-powder",
    name: "Haldi Powder",
    category: "spice",
    grams: 250,
    perKg: 400,
    sku: "SHR-HLD-250",
    type: "Powdered spice",
    gstRate: 5,
    shortDescription: "Everyday haldi (turmeric) powder for Indian cooking.",
    longDescription:
      "Finely ground turmeric powder with a warm aroma and golden-yellow colour. Ideal for everyday Indian cooking, including curries, dals, vegetable dishes and marinades.",
    imagePath: "/products/shrestha-haldi-powder.jpg",
  }),
  packed({
    id: "p8",
    slug: "shrestha-dhaniya-powder",
    name: "Dhania Powder",
    category: "spice",
    grams: 250,
    perKg: 400,
    sku: "SHR-DHN-250",
    type: "Powdered spice",
    gstRate: 5,
    shortDescription: "Everyday dhania (coriander) powder for Indian cooking.",
    longDescription:
      "Ground coriander powder with a mild, citrusy aroma and warm flavour. Suitable for curries, dals, vegetable dishes, chutneys and homemade spice blends.",
    imagePath: "/products/shrestha-dhaniya-powder.jpg",
  }),
  packed({
    id: "p9",
    slug: "shrestha-jeera-powder",
    name: "Jeera Powder",
    category: "spice",
    grams: 250,
    perKg: 400,
    sku: "SHR-JRA-250",
    type: "Powdered spice",
    gstRate: PROVISIONAL_GST_RATE,
    shortDescription: "Everyday jeera (cumin) powder for Indian cooking.",
    longDescription: SPICE_DESCRIPTION,
  }),
  packed({
    id: "p10",
    slug: "shrestha-cashew-320",
    name: "Cashew 320 Number",
    category: "dry-fruit",
    grams: 250,
    perKg: 8600,
    sku: "SHR-CSH320-250",
    type: "Whole cashew, W320 grade",
    gstRate: PROVISIONAL_GST_RATE,
    shortDescription: "Whole cashews, 320-count grade.",
    longDescription:
      "Whole cashews graded at 320 count — for snacking, sweets and everyday cooking. Hygienically packed.",
  }),
  packed({
    id: "p11",
    slug: "shrestha-cashew-double",
    name: "Cashew Double",
    category: "dry-fruit",
    grams: 250,
    perKg: 9200,
    sku: "SHR-CSHDBL-250",
    type: "Cashew",
    gstRate: PROVISIONAL_GST_RATE,
    shortDescription: "Cashews, double grade.",
    longDescription: "Double-grade cashews for snacking, sweets and cooking. Hygienically packed.",
  }),
  packed({
    id: "p12",
    slug: "shrestha-camphor-kapur",
    name: "Camphor (Kapur)",
    category: "pooja",
    grams: 250,
    perKg: 1000,
    sku: "SHR-KPR-250",
    type: "Camphor for pooja — not for eating",
    gstRate: PROVISIONAL_GST_RATE,
    shortDescription: "Camphor (kapur) for pooja and household use.",
    longDescription: "Camphor (kapur) for pooja and household use. Not for consumption.",
  }),
  packed({
    id: "p13",
    slug: "shrestha-tea-leaves",
    name: "Tea Leaves",
    category: "tea",
    grams: 250,
    perKg: 400,
    sku: "SHR-TEA-250",
    type: "Tea leaves",
    gstRate: PROVISIONAL_GST_RATE,
    shortDescription: "Tea leaves for your everyday cup of chai.",
    longDescription: "Tea leaves for everyday chai. Hygienically packed.",
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
