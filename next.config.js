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
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**' },
    ],
  },
  allowedDevOrigins: ['192.168.0.6'],
};

module.exports = nextConfig;