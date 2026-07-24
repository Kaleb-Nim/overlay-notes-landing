import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.VERCEL_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
