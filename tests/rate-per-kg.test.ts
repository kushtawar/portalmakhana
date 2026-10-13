// Rate per kg shown with every pack price, and the catalogue's display order.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { products } from "../src/lib/data/products";
import { packGrams, ratePerKgLabel } from "../src/lib/products/ratePerKg";

describe("rate per kg", () => {
  it("parses pack weights", () => {
    assert.equal(packGrams("250 g"), 250);
    assert.equal(packGrams("100g"), 100);
    assert.equal(packGrams("1 kg"), 1000);
    assert.equal(packGrams("4 x 100g Box"), null);
  });

  it("uses the catalogue's listed rate, else calculates it from pack weight and price", () => {
    assert.equal(
      ratePerKgLabel({ attributes: [{ label: "Price per kg", value: "₹1,300/kg" }], variants: [] }),
      "₹1,300/kg"
    );
    assert.equal(
      ratePerKgLabel({ attributes: [], variants: [{ id: "v1", label: "100 g", price: 150, sku: "x", stock: 1 }] }),
      "₹1,500/kg"
    );
    assert.equal(ratePerKgLabel({ attributes: [], variants: [{ id: "v1", label: "Gift box", price: 1, sku: "x", stock: 1 }] }), null);
  });

  it("every catalogue product's listed rate matches its pack price and weight", () => {
    for (const product of products) {
      const listed = ratePerKgLabel(product);
      const calculated = ratePerKgLabel({ attributes: [], variants: product.variants });
      assert.equal(listed, calculated, product.name);
    }
  });
});

describe("catalogue order (homepage)", () => {
  it("follows the business catalogue's serial order", () => {
    assert.deepEqual(
      products.map((p) => p.name),
      [
        "Makhana Diamond (6 Suta)",
        "Makhana Gold (5 Suta)",
        "Makhana Silver (4 Suta)",
        "Makhana Hand Picked Gold",
        "Makhana Hand Picked Diamond",
        "Khada Garam Masala",
        "Haldi Powder",
        "Dhania Powder",
        "Jeera Powder",
        "Cashew 320 Number",
        "Cashew Double",
        "Camphor (Kapur)",
        "Tea Leaves",
      ]
    );
  });

  it("Khada Garam Masala is a 100 g pack at ₹150 (₹1,500/kg)", () => {
    const masala = products.find((p) => p.slug === "shrestha-khada-garam-masala")!;
    assert.deepEqual([masala.variants[0].label, masala.variants[0].price, ratePerKgLabel(masala)], ["100 g", 150, "₹1,500/kg"]);
  });
});
