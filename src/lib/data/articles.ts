import type { Article } from "@/lib/types";

export const articles: Article[] = [
  {
    id: "a1",
    slug: "ten-years-of-makhana-rooted-in-patna",
    title: "10+ Years of Makhana, Rooted in Patna",
    excerpt:
      "How a decade of sourcing and grading experience in Patna shaped the way we bring Makhana to your table.",
    content: [
      "Patna has been at the heart of India's Makhana trade for generations, and our own journey with fox nuts started here more than ten years ago.",
      "Over the years we've worked closely with local farmers and processors to understand grading, moisture control and roasting — the details that decide whether a pack of Makhana is merely average or genuinely premium.",
      "That experience is what lets us stand behind every pack we ship today, from a single retail order to a container-scale export shipment.",
    ],
    coverImageLabel: "Patna Origin Story",
    author: "ItarIntakes Team",
    category: "Stories",
    tags: ["origin", "patna", "brand"],
    publishDate: "2026-01-15",
    status: "published",
    featured: true,
  },
  {
    id: "a2",
    slug: "makhana-grades-explained-what-suta-really-means",
    title: "Makhana Grades Explained: What “Suta” Really Means",
    excerpt:
      "A short guide to how Makhana is graded, and why grade matters for taste, texture and price.",
    content: [
      "Makhana is graded by size, shape and puff quality, and “Suta” refers to one of the more consistent, popular grades used across premium retail and export packs.",
      "Higher grades typically pop more evenly during roasting, giving a lighter, crunchier bite with fewer unpopped kernels.",
      "When you're comparing Makhana brands, grade is one of the biggest (and least visible) reasons for price differences.",
    ],
    coverImageLabel: "Makhana Grades",
    author: "ItarIntakes Team",
    category: "Makhana Knowledge",
    tags: ["grades", "suta", "quality"],
    publishDate: "2026-02-02",
    status: "published",
  },
  {
    id: "a3",
    slug: "roasted-makhana-chaat-a-10-minute-evening-snack",
    title: "Roasted Makhana Chaat: A 10-Minute Evening Snack",
    excerpt: "A quick, healthier take on chaat using roasted Makhana as the base.",
    content: [
      "Roasted Makhana makes a great low-effort base for a chaat-style snack — crunchy, light and quick to put together.",
      "Toss roasted Makhana with chopped onion, tomato, coriander, a squeeze of lemon, chaat masala and roasted peanuts.",
      "Serve immediately while the Makhana is still crisp for the best texture.",
    ],
    coverImageLabel: "Makhana Chaat Recipe",
    author: "ItarIntakes Team",
    category: "Recipes",
    tags: ["recipe", "snack", "chaat"],
    publishDate: "2026-02-20",
    status: "published",
  },
  {
    id: "a4",
    slug: "why-makhana-is-a-smart-everyday-protein-snack",
    title: "Why Makhana Is a Smart Everyday Snack",
    excerpt:
      "A practical look at why Makhana has become a popular everyday snacking choice in Indian households.",
    content: [
      "Makhana is naturally low in fat and free of cholesterol, which is part of why it has become a popular everyday snacking choice.",
      "It's commonly enjoyed roasted with a light seasoning, making it easy to fit into most diets without much preparation.",
      "As always, individual nutrition needs vary — this article is general information, not medical advice.",
    ],
    coverImageLabel: "Health & Nutrition",
    author: "ItarIntakes Team",
    category: "Health & Nutrition",
    tags: ["health", "nutrition"],
    publishDate: "2026-03-05",
    status: "published",
  },
  {
    id: "a5",
    slug: "itarintakes-now-ships-pan-india",
    title: "ItarIntakes Now Ships Pan-India",
    excerpt: "An update on our expanded delivery coverage across India.",
    content: [
      "We're glad to share that ItarIntakes now ships across India, alongside our existing wholesale and export capability.",
      "Retail customers can now order directly through our online store, with the same quality and grading standards we've maintained for our business partners for over a decade.",
    ],
    coverImageLabel: "Company Update",
    author: "ItarIntakes Team",
    category: "Company News",
    tags: ["shipping", "update"],
    publishDate: "2026-03-18",
    status: "published",
  },
  {
    id: "a6",
    slug: "makhana-kheer-for-festive-season",
    title: "Makhana Kheer for the Festive Season",
    excerpt: "A simple, traditional Makhana kheer recipe for festive occasions.",
    content: [
      "Makhana kheer is a festive favourite — lightly roasted fox nuts simmered in sweetened, reduced milk with cardamom and nuts.",
      "Use our Raw Premium Makhana for the best texture; lightly roast before adding to the milk for extra crunch in every spoonful.",
    ],
    coverImageLabel: "Makhana Kheer Recipe",
    author: "ItarIntakes Team",
    category: "Recipes",
    tags: ["recipe", "festive", "kheer"],
    publishDate: "2026-03-25",
    status: "published",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
