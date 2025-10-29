import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  reactStrictMode: true,
  compiler: {
    reactRemoveProperties: false,
  },
};

export default nextConfig;
