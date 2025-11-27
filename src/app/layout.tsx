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
  metadataBase: new URL('https://www.ccs724.com'),
  title: 'CCS724 – Tienda de electrónica',
  description: 'CCS724 — Tienda online de MONDSUB y REMAX.',
  openGraph: {
    title: 'CCS724',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    url: 'https://www.ccs724.com',
    siteName: 'CCS724',
    images: [
      'https://www.ccs724.com/images/AVALOGO/logo_ccs.png',
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCS724',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    images: [
      'https://www.ccs724.com/images/AVALOGO/logo_ccs.png',
    ],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
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