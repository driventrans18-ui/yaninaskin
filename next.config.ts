import type { NextConfig } from "next";

const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} as const satisfies NextConfig;

export default nextConfig;
