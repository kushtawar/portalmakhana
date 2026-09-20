import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "pdf-parse", "pdfjs-dist"],
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
