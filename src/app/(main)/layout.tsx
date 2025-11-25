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
      <MetaPixel />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}