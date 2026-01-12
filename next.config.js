/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.ccs724.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'ccs724.com',
        pathname: '/images/**',
      },
    ],
  },
};

module.exports = nextConfig;