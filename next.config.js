const withNextIntl = require('next-intl/plugin')(
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect non-www to www and ensure HTTPS (permanent 308 redirects for SEO)
  async redirects() {
    return [
      // Redirect non-www to www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'vuelatour.com',
          },
        ],
        destination: 'https://www.vuelatour.com/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    // Remote patterns for Supabase Storage and other image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'static.tacdn.com',
        pathname: '/**',
      },
    ],
    // Image formats for optimization
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = withNextIntl(nextConfig);