import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Header from '@/components/layout/Header';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { LazyCookieBanner } from '@/components/layout/LazyComponents';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import ScrollTracker from '@/components/analytics/ScrollTracker';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import '../globals.css';

// Modern, clean font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const locales = ['es', 'en'];

// Global metadata base URL for all pages
export const metadata: Metadata = {
  metadataBase: new URL('https://www.vuelatour.com'),
  icons: {
    icon: '/images/logo/logo-vuelatour.webp',
    shortcut: '/images/logo/logo-vuelatour.webp',
    apple: '/images/logo/logo-vuelatour.webp',
  },
  other: {
    'msapplication-TileColor': '#102a43',
  },
  // Preconnect links for performance
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#102a43' },
  ],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Critical preconnects for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Supabase for faster image loading */}
        <link rel="preconnect" href="https://qrfnlmwjpyolusntakvy.supabase.co" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Theme detection script - must be inline to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            <LoadingProvider>
              <AnalyticsProvider>
                <ScrollTracker />
                <Header />
                <main>{children}</main>
                <FooterWrapper />
                <LazyCookieBanner />
              </AnalyticsProvider>
            </LoadingProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}