import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/download/:path*',
        destination: '/api/serve/:path*',
      },
    ];
  },
};

export default nextConfig;
