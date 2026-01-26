import type {Metadata} from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { AuthenticatedChatWidget } from "@/components/chat/AuthenticatedChatWidget";

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
  other: {
    'facebook-domain-verification': 'rmdknrgveo9uffmm4btk86smu7b2ag',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
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

        {/* Widget de chat con autenticación */}
        <AuthenticatedChatWidget />
      </body>
    </html>
  );
}