import mongoose from "mongoose";
import { ArticleModel } from "@/lib/db/models/Article";
import { articles } from "@/lib/data/articles";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  // Optional slug arguments limit the seed to those articles, so existing
  // articles an admin has edited are not overwritten.
  const onlySlugs = process.argv.slice(2);
  const toSeed = onlySlugs.length
    ? articles.filter((article) => onlySlugs.includes(article.slug))
    : articles;
  console.log(`Connected. Seeding ${toSeed.length} articles...`);

  for (const article of toSeed) {
    const { id: _id, publishDate, ...rest } = article;
    void _id;
    await ArticleModel.findOneAndUpdate(
      { slug: article.slug },
      { $set: { ...rest, publishDate: new Date(publishDate), status: "published" } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    console.log(`  upserted: ${article.slug}`);
  }

  const count = await ArticleModel.countDocuments();
  console.log(`Done. ${count} articles now in the collection.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
