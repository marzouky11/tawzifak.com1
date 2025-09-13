

import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/app-layout';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
});

const baseUrl = 'https://www.tawzifak.com';
const appName = 'توظيفك';
const appDescription = "منصة توظيفك تجمع لك أحدث عروض العمل والمباريات العمومية وفرص البحث عن عمل بسهولة. تصفح الوظائف حسب المدينة والفئة وابقَ على اطلاع دائم بأحدث الفرص المهنية.";
const appOgImage = 'https://www.tawzifak.com/og-image.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`
  },
  description: appDescription,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
   alternates: {
    canonical: '/',
  },
  openGraph: {
    title: {
      default: appName,
      template: `%s | ${appName}`
    },
    description: appDescription,
    url: '/',
    siteName: appName,
    images: [
      {
        url: appOgImage,
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: appName,
      template: `%s | ${appName}`
    },
    description: appDescription,
    images: [appOgImage],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appName,
    url: baseUrl,
    logo: appOgImage,
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/jobs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        {/* <!-- Google tag (gtag.js) --> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FE0MP7XYXM"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FE0MP7XYXM');
            `,
          }}
        />
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "f8c5f33a-cf71-43d7-a723-ef8f7125f5fb",
                  v2AppId: "os_v2_app_7dc7gowpofb5pjzd56hxcjpv7mndgmfdmhgeh7mzf32rbl66tetrens3ngkpv3px6vhwoprlpi2eo4qcb3snn3yv4wdghc4eeffoqnq",
                  notifyButton: {
                    enable: true
                  },
                  allowLocalhostAsSecureOrigin: true,
                  autoRegister: true
                });
              });
            `
        }} />
      </head>
      <body className={cn("antialiased", tajawal.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
