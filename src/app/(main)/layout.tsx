import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MetaPixel from '@/components/analytics/MetaPixel';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* El Suspense es OBLIGATORIO aquí porque MetaPixel lee la URL */}
      <Suspense fallback={null}>
        <MetaPixel />
      </Suspense>
      
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}