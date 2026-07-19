import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@lobehub/fluent-emoji'],
  headers: async () => [
    {
      source: '/admin/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' },
        { key: 'Surrogate-Control', value: 'no-store' },
      ],
    },
  ],
};

export default nextConfig;
