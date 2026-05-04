import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { APP_URL } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Next 15+ wants `themeColor` / `viewport` here rather than in `metadata` —
// gives the splash background and the Android chrome bar a consistent colour
// (matches `manifest.theme_color`).
export const viewport: Viewport = {
  themeColor: "#6b21a8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nidlo — Where every stitch begins",
    template: "%s | Nidlo",
  },
  description:
    "Connect with talented seamstresses, tailors, and fashion designers for custom-made clothing in Ghana and West Africa. Track your garment from design to delivery.",
  keywords: [
    "custom clothing",
    "tailor",
    "seamstress",
    "fashion designer",
    "Ghana",
    "West Africa",
    "bespoke fashion",
    "Nidlo",
  ],
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: "Nidlo",
  },
  twitter: {
    // The root opengraph-image.tsx auto-populates the image; designer
    // profiles override via their own file-convention OG image.
    card: "summary_large_image",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/icon-192x192.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <PwaInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
