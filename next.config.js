/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    domains: [
      'via.placeholder.com',
      'ae-pic-a1.aliexpress-media.com',
      'ae01.alicdn.com',
      'ae02.alicdn.com',
      'ae03.alicdn.com',
      'ae04.alicdn.com',
      'ae05.alicdn.com',
      'aliexpress.com',
      'aliexpress-media.com',
      'pokermerchant.com',
      'cdn.shopify.com',
      'images.unsplash.com',
      'img.alicdn.com',
      'picsum.photos',
      'placehold.co',
      'placekitten.com',
      'loremflickr.com',
      'dummyimage.com',
      'srv751233.hstgr.cloud'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://srv751233.hstgr.cloud',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Ensure static files are properly served
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 