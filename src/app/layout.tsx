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
  title: "The Navajo Movie Talkers",
  description: "A Film Discussion Club - Track and rate movies together",
  metadataBase: new URL("https://movie-club-mattmcguins-projects.vercel.app"),
  openGraph: {
    title: "The Navajo Movie Talkers",
    description: "A Film Discussion Club - Track and rate movies together",
    images: [
      {
        url: "/og-image.jpg",
        width: 1512,
        height: 816,
        alt: "The Navajo Movie Talkers - A Film Discussion Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Navajo Movie Talkers",
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
      <body
        className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
