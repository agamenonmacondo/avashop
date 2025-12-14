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
      {
        url: 'https://www.ccs724.com/images/AVALOGO/ccs724_logo_transparent.png',
        width: 1200,
        height: 630,
        alt: 'CCS724 Logo',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCS724',
    description: 'Tienda online de teléfonos, accesorios y MacBooks.',
    images: ['https://www.ccs724.com/images/AVALOGO/ccs724_logo_transparent.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png?v=2', type: 'image/png', sizes: '96x96' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  applicationName: 'CCS724',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CCS724',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* ❌ BORRA ESTAS LÍNEAS (Next.js ya las genera desde 'metadata') */}
        {/* <link rel="icon" href="/favicon.ico" sizes="48x48" /> */}
        {/* <link rel="icon" href="/favicon.svg" type="image/svg+xml" /> */}
        {/* <link rel="shortcut icon" href="/favicon.ico" /> */}
        
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CCS724" />
        
        <Script 
          src="https://checkout.bold.co/library/boldPaymentButton.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {/* Google Analytics Tag */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-LG1GRLGG04"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LG1GRLGG04');
          `}
        </Script>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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