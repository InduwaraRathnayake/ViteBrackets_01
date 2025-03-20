import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript:{
    ignoreBuildErrors: true,
  }, reactStrictMode: true,
  images: {
    domains: [],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET : process.env.JWT_SECRET,
  },
};

export default nextConfig;