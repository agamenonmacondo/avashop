import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'CCS724 | Tienda de Electrónica y Tecnología en Colombia',
  description: 'Encuentra micrófonos Remax, estabilizadores, accesorios para celulares y más...',
  alternates: {
    canonical: 'https://www.ccs724.com',
  },
  openGraph: {
    title: 'CCS724 | Tecnología y Accesorios',
    description: 'Micrófonos, audio y accesorios móviles de alta calidad.',
    url: 'https://www.ccs724.com',
    siteName: 'CCS724',
  },
  icons: {
    icon: '/images/AVALOGO/logo_ccs.png?v=2',
    shortcut: '/images/AVALOGO/logo_ccs.png?v=2',
    apple: '/images/AVALOGO/logo_ccs.png?v=2',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
