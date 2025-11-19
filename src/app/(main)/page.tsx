import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'CCS724 | Tienda de Electrónica y Tecnología en Colombia',
  description: 'Encuentra micrófonos Remax, estabilizadores y accesorios con envíos a toda Colombia.',
  alternates: { canonical: 'https://www.ccs724.com' },
  openGraph: {
    title: 'CCS724 | Tecnología y Accesorios',
    description: 'Micrófonos, audio y accesorios móviles de alta calidad.',
    url: 'https://www.ccs724.com',
    siteName: 'CCS724',
    locale: 'es_CO',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
