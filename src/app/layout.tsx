import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StitchHub - Custom Fashion, Connected",
    template: "%s | StitchHub",
  },
  description:
    "Connect with talented seamstresses, tailors, and fashion designers for custom-made clothing. Track your garment from design to delivery.",
  keywords: [
    "custom clothing",
    "tailor",
    "seamstress",
    "fashion designer",
    "Ghana",
    "bespoke fashion",
  ],
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: "StitchHub",
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
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
