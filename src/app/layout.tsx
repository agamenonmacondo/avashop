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

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ccs724.com'),
  title: {
    default: 'CCS724 | Tienda de Electrónica y Tecnología en Colombia',
    template: '%s | CCS724',
  },
  description: 'Encuentra lo último en tecnología, accesorios para celulares, audio y gadgets en Colombia. Envíos a todo el país.',
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
    icon: [
      { url: '/images/favicon.ico?v=2', sizes: 'any' },
      { url: '/images/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/images/favicon-96x96.png?v=2', type: 'image/png', sizes: '96x96' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/images/site.webmanifest',
      },
    ],
  },
  manifest: '/images/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
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