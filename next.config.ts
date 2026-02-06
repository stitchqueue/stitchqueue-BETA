import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "humble-fishstick-5g6qw4xpp4jxhv56j-3000.app.github.dev",
      ],
    },
  },
};

export default nextConfig;