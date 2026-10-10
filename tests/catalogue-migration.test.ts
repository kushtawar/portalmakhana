// Planning rules of scripts/update-catalogue.ts, against fixtures shaped like the live
// database documents. No database connection is made.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInsert, planProductUpdate } from "../scripts/lib/catalogue";
import { products } from "../src/lib/data/products";

const catalogue = (slug: string) => products.find((p) => p.slug === slug)!;
const S3_IMAGE = "https://itarintakes.s3.eu-central-1.amazonaws.com/media/products/abc.jpg";

const liveSilver = {
  slug: "shrestha-silver-makhana",
  name: "Silver Makhana",
  shortDescription: "Our regular graded makhana.",
  longDescription: "An admin-edited description.",
  category: "makhana",
  grade: "Silver",
  gstRate: 5,
  priceIncludesTax: true,
  variants: [{ id: "v1", label: "250 g", price: 225, sku: "SHR-SLV-250", stock: 37, lowStockThreshold: 10 }],
  imageLabels: ["Shrestha Silver Makhana"],
  imagePath: S3_IMAGE,
  featured: true,
  bestseller: false,
  active: true,
  attributes: [
    { label: "Brand", value: "Shrestha (by ItarIntakes)" },
    { label: "Net weight", value: "250 g" },
    { label: "Price per kg", value: "₹900/kg" },
    { label: "Selection", value: "Regular graded selection" },
  ],
};

const liveHaldi = {
  ...liveSilver,
  slug: "shrestha-haldi-powder",
  name: "Haldi Powder",
  category: "spice",
  grade: undefined,
  longDescription: "… Shrestha Haldi, Dhaniya and Mircha are simple, useful spice essentials …",
  variants: [{ id: "v1", label: "1 kg", price: 400, sku: "SHR-HLD-1000", stock: 1000, lowStockThreshold: 10 }],
  attributes: [
    { label: "Brand", value: "Shrestha (by ItarIntakes)" },
    { label: "Price per kg", value: "₹400/kg" },
    { label: "Type", value: "Powdered spice" },
  ],
};

describe("catalogue migration: existing products", () => {
  it("updates only name, pack price and managed details; keeps business-critical fields", () => {
    const { set } = planProductUpdate(liveSilver, catalogue("shrestha-silver-makhana"));
    assert.deepEqual(Object.keys(set).sort(), ["attributes", "grade", "imageLabels", "name", "variants"]);
    for (const kept of ["imagePath", "gstRate", "priceIncludesTax", "featured", "bestseller", "active", "longDescription", "shortDescription"]) {
      assert.ok(!(kept in set), `${kept} must not be changed`);
    }
    const variants = set.variants as { price: number; stock: number; sku: string; lowStockThreshold: number }[];
    assert.equal(variants[0].price, 200);
    assert.equal(variants[0].stock, 37, "stock kept");
    assert.equal(variants[0].sku, "SHR-SLV-250");
    assert.equal(variants[0].lowStockThreshold, 10);
    const attributes = set.attributes as { label: string; value: string }[];
    assert.deepEqual(attributes.map((a) => a.label), ["Brand", "Net weight", "Price per kg", "Selection"]);
    assert.equal(attributes.find((a) => a.label === "Price per kg")!.value, "₹800/kg");
    assert.equal(attributes.find((a) => a.label === "Brand")!.value, "Shrestha (by ItarIntakes)", "brand left to the rebrand script");
  });

  it("replaces the Haldi description that lists Mircha, keeping its image and GST", () => {
    const { set } = planProductUpdate(liveHaldi, catalogue("shrestha-haldi-powder"));
    assert.equal(set.longDescription, catalogue("shrestha-haldi-powder").longDescription);
    assert.ok(!String(set.longDescription).includes("Mircha"));
    assert.ok(!("imagePath" in set) && !("gstRate" in set));
  });

  it("enforces the Haldi/Dhania description even if it is edited back later", () => {
    const reverted = { ...liveHaldi, longDescription: "Something else" };
    assert.equal(planProductUpdate(reverted, catalogue("shrestha-haldi-powder")).set.longDescription, catalogue("shrestha-haldi-powder").longDescription);
  });

  it("is a no-op once applied (safe to re-run)", () => {
    const wanted = catalogue("shrestha-haldi-powder");
    const { set } = planProductUpdate(liveHaldi, wanted);
    const applied = { ...liveHaldi, ...set };
    assert.deepEqual(planProductUpdate(applied, wanted).set, {});
  });
});

describe("catalogue migration: new products", () => {
  it("inserts with explicit flags, provisional GST, placeholder photo and confirmed price", () => {
    const doc = buildInsert(catalogue("shrestha-cashew-320"), new Date(0));
    assert.equal(doc.featured, false);
    assert.equal(doc.bestseller, false);
    assert.equal(doc.gstRate, 5);
    assert.equal(doc.imagePath, "/products/placeholders/shrestha-cashew-320.jpg");
    assert.equal((doc.variants as { price: number; lowStockThreshold: number }[])[0].price, 2150);
    assert.equal((doc.variants as { lowStockThreshold: number }[])[0].lowStockThreshold, 10);
    assert.ok(!("id" in doc));
    assert.ok(Object.values(doc).every((v) => v !== undefined), "no undefined fields");
  });
});
