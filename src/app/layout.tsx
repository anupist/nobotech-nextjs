import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Geist_Mono } from "next/font/google";
import { db } from "@/lib/db";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getSiteFavicon(): Promise<{ url: string; custom: boolean }> {
  try {
    const setting = await db.setting.findUnique({ where: { key: 'site_favicon' } });
    if (setting?.value) return { url: setting.value, custom: true };
  } catch {
    // ignore
  }
  return { url: '/favicon.svg', custom: false };
}

function faviconType(url: string): string {
  const lower = url.toLowerCase()
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.ico')) return 'image/x-icon'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/x-icon'
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "KinleyMart - Quality Products, Best Value, Fast Delivery",
    description: "Discover quality products at the best value with fast delivery. Shop the latest trends at KinleyMart.",
    keywords: ["KinleyMart", "e-commerce", "online shopping", "fashion", "electronics", "home", "Next.js"],
    authors: [{ name: "KinleyMart Team" }],
    openGraph: {
      title: "KinleyMart - Quality Products, Best Value, Fast Delivery",
      description: "Discover quality products at the best value with fast delivery.",
      url: "https://kinleymart.com",
      siteName: "KinleyMart",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "KinleyMart - Quality Products, Best Value, Fast Delivery",
      description: "Discover quality products at the best value with fast delivery.",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { url: favicon, custom } = await getSiteFavicon();
  const type = faviconType(favicon);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href={favicon} type={type} />
        {!custom && (
          <>
            <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
            <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
            <link rel="shortcut icon" href="/favicon.ico" />
          </>
        )}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0D1B3D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.className=t}catch(e){}})()`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
