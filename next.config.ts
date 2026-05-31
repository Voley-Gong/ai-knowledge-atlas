import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ai-knowledge-atlas',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
