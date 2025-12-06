import { Suspense } from 'react';
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
      {/* Meta Pixel */}
      <Suspense fallback={null}>
        <MetaPixel />
      </Suspense>
      
      {/* Google Ads */}
      <GoogleAds />
      
      {/* TikTok Pixel */}
      <Suspense fallback={null}>
        <TikTokPixel />
      </Suspense>
      
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}