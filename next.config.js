/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
      'dummyimage.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

module.exports = nextConfig; 