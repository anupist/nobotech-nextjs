import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "KinleyMart - Quality Products, Best Value, Fast Delivery",
  description: "Discover quality products at the best value with fast delivery. Shop the latest trends at KinleyMart.",
  keywords: ["KinleyMart", "e-commerce", "online shopping", "fashion", "electronics", "home", "Next.js"],
  authors: [{ name: "KinleyMart Team" }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#0D1B3D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
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
