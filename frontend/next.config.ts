import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Essential for small Docker images
  eslint: {
    // Build ke time linting errors ignore karega
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Build ke time type errors ignore karega
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
