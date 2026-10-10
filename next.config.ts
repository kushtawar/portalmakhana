import type { NextConfig } from "next";
import { ARTICLE_SLUG_RENAMES } from "./src/lib/articleSlugRenames";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "pdf-parse", "pdfjs-dist"],
  // Article slugs renamed by the PatnaMakhana rebrand: old URLs redirect permanently.
  async redirects() {
    return Object.entries(ARTICLE_SLUG_RENAMES).map(([from, to]) => ({
      source: `/stories/${from}`,
      destination: `/stories/${to}`,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.S3_BUCKET_NAME}.s3.${process.env.APP_REGION}.amazonaws.com`,
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
