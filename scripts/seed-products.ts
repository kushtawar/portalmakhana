import mongoose from "mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { products } from "@/lib/data/products";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected. Seeding ${products.length} products...`);

  for (const product of products) {
    const { id: _id, ...rest } = product;
    void _id;
    await ProductModel.findOneAndUpdate(
      { slug: product.slug },
      { $set: rest },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    console.log(`  upserted: ${product.slug}`);
  }

  // Hide (not delete) anything that isn't in the catalogue, so old sample
  // products disappear from the shop but stay recoverable in the admin.
  const hidden = await ProductModel.updateMany(
    { slug: { $nin: products.map((p) => p.slug) }, active: true },
    { $set: { active: false, featured: false, bestseller: false } }
  );
  console.log(`  hid ${hidden.modifiedCount} product(s) not in the catalogue`);

  const count = await ProductModel.countDocuments();
  console.log(`Done. ${count} products now in the collection.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
