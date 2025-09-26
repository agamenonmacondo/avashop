import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // Mantener otras configuraciones experimentales aquí si las hubiera en el futuro
  },
  allowedDevOrigins: [
   
    'http://localhost:9004',
  'http://192.168.0.6:3000', // <-- ejemplo puerto 3000
  'http://192.168.0.6:9004', // añadido: coincide con logs (puerto 9004)
  // añade otros orígenes/puertos si accedes desde diferentes dispositivos/puertos
  ],
};

export default nextConfig;
