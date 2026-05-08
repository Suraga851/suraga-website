import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/suraga-3d",
  output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    SITE_URL: process.env.SITE_URL || "https://suraga-website.vercel.app",
  },
};

export default nextConfig;
