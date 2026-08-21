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

export async function generateMetadata(): Promise<Metadata> {
  const { url: favicon, custom } = await getSiteFavicon();
  const lower = favicon.toLowerCase();

  const icon: Array<{ url: string; sizes?: string; type?: string }> = [];
  if (lower.endsWith('.svg')) icon.push({ url: favicon, type: 'image/svg+xml' });
  else if (lower.endsWith('.png')) icon.push({ url: favicon, type: 'image/png' });
  else if (lower.endsWith('.ico')) icon.push({ url: favicon });
  else icon.push({ url: favicon });

  if (!custom) {
    icon.push({ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' });
    icon.push({ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' });
  }

  return {
    title: "KinleyMart - Quality Products, Best Value, Fast Delivery",
    description: "Discover quality products at the best value with fast delivery. Shop the latest trends at KinleyMart.",
    keywords: ["KinleyMart", "e-commerce", "online shopping", "fashion", "electronics", "home", "Next.js"],
    authors: [{ name: "KinleyMart Team" }],
    icons: {
      icon,
      shortcut: lower.endsWith('.ico') ? favicon : '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
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
