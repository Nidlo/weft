import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { Providers } from "@/providers/providers";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
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

// Editorial display serif. Paired with Geist for body copy; the
// optical-size axis pushes high for large headlines (opsz: 144 in
// .text-display).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

// Match `manifest.theme_color` and the new bone-light surface so Android
// chrome bar / iOS status bar blend into the brand surface.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1612" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nidlo. Where every stitch begins",
    template: "%s | Nidlo",
  },
  description:
    "Connect with talented seamstresses, tailors, and fashion designers for custom-made clothing. Track your garment from design to delivery.",
  keywords: [
    "custom clothing",
    "tailor",
    "seamstress",
    "fashion designer",
    "bespoke fashion",
    "Nidlo",
  ],
  openGraph: {
    type: "website",
    locale: "en",
    siteName: "Nidlo",
    // Explicit so per-page metadata exports that spread `openGraph`
    // without `images` still serve the branded share card. File-convention
    // fallback covers the rest; designer profiles override per-route.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Nidlo. Where every stitch begins",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <PwaInstallPrompt />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
