import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  // Django's API contract is slash-terminated. Preserve it through the proxy
  // instead of allowing Next and Django to redirect each other indefinitely.
  skipTrailingSlashRedirect: true,
  transpilePackages: ['@galactic-gunners/game'],
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${process.env.INTERNAL_API_ORIGIN ?? 'http://backend:8000'}/api/v1/:path*/` }];
  },
};

export default nextConfig;
