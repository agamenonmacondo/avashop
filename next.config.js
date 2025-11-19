/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', port: '', pathname: '/**' },
    ],
  },
  experimental: {
    metadataBase: new URL('https://www.ccs724.com'),
  },
  allowedDevOrigins: [
    'http://localhost:9004',
    'http://192.168.0.6:9004', // agrega aquí la IP desde donde accedes
  ],
};

const path = require('path');

module.exports = {
  ...nextConfig,
  outputFileTracingRoot: path.join(__dirname),
};