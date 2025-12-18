import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navajo Movie Talkers",
  description: "A Film Discussion Club - Track and rate movies together",
  metadataBase: new URL("https://navajomovietalkers.com"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NMT",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Navajo Movie Talkers",
    description: "A Film Discussion Club - Track and rate movies together",
    images: [
      {
        url: "/og-image.jpg",
        width: 1512,
        height: 816,
        alt: "Navajo Movie Talkers - A Film Discussion Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Navajo Movie Talkers",
    description: "A Film Discussion Club - Track and rate movies together",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#f59e0b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NMT" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
