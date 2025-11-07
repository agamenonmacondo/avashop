import type {Metadata} from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { cn } from '@/lib/utils';
import Script from 'next/script';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'CCS724 – Tienda de electrónica',
  description: 'CCS724 — Tienda online  de MONDSUB y REMAX.',
  applicationName: 'CCS724',
  authors: [{ name: 'CCS724', url: process.env.NEXT_PUBLIC_APP_URL }],
  openGraph: {
    title: 'CCS724',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'CCS724',
    images: [
      // Logo principal (CCS724) primero, AVA como secundario
      `${process.env.NEXT_PUBLIC_APP_URL}/images/CCS724/ccs724_logo.png`,
      `${process.env.NEXT_PUBLIC_APP_URL}/images/AVALOGO/ava_logo.png`,
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCS724',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL}/images/CCS724/ccs724_logo.png`,
      `${process.env.NEXT_PUBLIC_APP_URL}/images/AVALOGO/ava_logo.png`,
    ],
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
      <head>
        <Script 
          src="https://checkout.bold.co/library/boldPaymentButton.js" 
          strategy="beforeInteractive"
        />
      </head>
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