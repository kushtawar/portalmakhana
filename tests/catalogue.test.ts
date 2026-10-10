// The catalogue must match the business's product list exactly: name, pack weight and
// rate per kg (pack price = rate × weight).

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROVISIONAL_GST_RATE, products } from "../src/lib/data/products";

const EXPECTED: [name: string, weight: string, perKg: number][] = [
  ["Makhana Diamond (6 Suta)", "250 g", 1300],
  ["Makhana Gold (5 Suta)", "250 g", 940],
  ["Makhana Silver (4 Suta)", "250 g", 800],
  ["Makhana Hand Picked Gold", "250 g", 1100],
  ["Makhana Hand Picked Diamond", "250 g", 1400],
  ["Khada Garam Masala", "100 g", 1500],
  ["Haldi Powder", "250 g", 400],
  ["Dhania Powder", "250 g", 400],
  ["Jeera Powder", "250 g", 400],
  ["Cashew 320 Number", "250 g", 8600],
  ["Cashew Double", "250 g", 9200],
  ["Camphor (Kapur)", "250 g", 1000],
  ["Tea Leaves", "250 g", 400],
];

describe("product catalogue", () => {
  it("has exactly the 13 listed products", () => {
    assert.deepEqual(products.map((p) => p.name).sort(), EXPECTED.map(([n]) => n).sort());
  });

  for (const [name, weight, perKg] of EXPECTED) {
    it(`${name}: ${weight} at ₹${perKg}/kg`, () => {
      const product = products.find((p) => p.name === name)!;
      assert.equal(product.variants.length, 1);
      const [variant] = product.variants;
      assert.equal(variant.label, weight);
      assert.equal(variant.price, Math.round((perKg * parseInt(weight)) / 1000));
      assert.equal(
        product.attributes.find((a) => a.label === "Price per kg")?.value,
        `₹${perKg.toLocaleString("en-IN")}/kg`
      );
      assert.equal(product.attributes.find((a) => a.label === "Net weight")?.value, weight);
    });
  }

  const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;
  const NEW_PRODUCTS = [
    "shrestha-khada-garam-masala",
    "shrestha-jeera-powder",
    "shrestha-cashew-320",
    "shrestha-cashew-double",
    "shrestha-camphor-kapur",
    "shrestha-tea-leaves",
  ];

  it("Haldi and Dhania have their own descriptions, without Mircha", () => {
    assert.equal(
      bySlug("shrestha-haldi-powder").longDescription,
      "Finely ground turmeric powder with a warm aroma and golden-yellow colour. Ideal for everyday Indian cooking, including curries, dals, vegetable dishes and marinades."
    );
    assert.equal(
      bySlug("shrestha-dhaniya-powder").longDescription,
      "Ground coriander powder with a mild, citrusy aroma and warm flavour. Suitable for curries, dals, vegetable dishes, chutneys and homemade spice blends."
    );
    for (const p of products) assert.ok(!/mirch/i.test(JSON.stringify(p)), `${p.name} mentions Mircha`);
  });

  it("the six new products use the provisional 5% total GST", () => {
    assert.equal(PROVISIONAL_GST_RATE, 5); // one combined rate, not CGST/SGST halves
    for (const slug of NEW_PRODUCTS) assert.equal(bySlug(slug).gstRate, 5, slug);
  });

  it("the seven existing products keep 5% GST", () => {
    for (const p of products.filter((p) => !NEW_PRODUCTS.includes(p.slug))) assert.equal(p.gstRate, 5, p.slug);
  });

  it("keeps the confirmed cashew prices", () => {
    assert.equal(bySlug("shrestha-cashew-320").variants[0].price, 2150);
    assert.equal(bySlug("shrestha-cashew-double").variants[0].price, 2300);
  });

  it("new products sit in the right shop categories", () => {
    assert.deepEqual(
      NEW_PRODUCTS.map((slug) => bySlug(slug).category),
      ["spice", "spice", "dry-fruit", "dry-fruit", "pooja", "tea"]
    );
  });

  it("uses unique slugs and SKUs, and every product has a picture", () => {
    assert.equal(new Set(products.map((p) => p.slug)).size, products.length);
    assert.equal(new Set(products.map((p) => p.variants[0].sku)).size, products.length);
    for (const p of products) assert.ok(p.imagePath, `${p.name} has no picture`);
  });
});
