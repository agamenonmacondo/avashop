import { Suspense } from 'react';
// ❌ Eliminamos la importación de Head porque ya no se usa aquí
// import Head from 'next/head'; 
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MetaPixel from '@/components/analytics/MetaPixel';
import GoogleAds from '@/components/analytics/GoogleAds';
import TikTokPixel from '@/components/analytics/TikTokPixel';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 
         ❌ ELIMINADO: Este bloque <Head> sobraba. 
         Next.js ya inyecta los favicons automáticamente gracias 
         a la configuración 'metadata' en src/app/layout.tsx 
      */}
      
      <Suspense fallback={null}>
        <MetaPixel />
      </Suspense>
      <GoogleAds />
      <Suspense fallback={null}>
        <TikTokPixel />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}