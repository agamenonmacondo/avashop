import type {Metadata} from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'AVA Shop – Tienda de electrónica',
  description: 'Tienda online de teléfonos, accesorios y MacBooks. Precios, reseñas y envíos.',
  applicationName: 'AVA Shop',
  authors: [{ name: 'AVA', url: 'https://ava.example.com' }],
  openGraph: {
    title: 'AVA Shop',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'AVA Shop',
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL}/images/AVALOGO/ava_logo.png`,
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVA Shop',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/AVALOGO/ava_logo.png`],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontSans.variable, fontMono.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
