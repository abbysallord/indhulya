import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://indhulya.vercel.app'),
  title: {
    default: "INDHULYA | Pristine Luxury | One Gram Gold & Temple Jewellery",
    template: "%s | INDHULYA"
  },
  description: "Discover Indhulya's exquisite collection of one gram gold, heritage, and temple jewellery. Experience pristine luxury with our handcrafted, affordable demi-fine jewelry designed for everyday elegance.",
  openGraph: {
    title: "INDHULYA | Pristine Luxury | One Gram Gold & Temple Jewellery",
    description: "Discover Indhulya's exquisite collection of one gram gold, heritage, and temple jewellery. Experience pristine luxury with our handcrafted, affordable demi-fine jewelry designed for everyday elegance.",
    url: 'https://indhulya.vercel.app',
    siteName: 'Indhulya',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'INDHULYA | Pristine Luxury',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "INDHULYA | Pristine Luxury",
    description: "Discover Indhulya's exquisite collection of one gram gold, heritage, and temple jewellery. Experience pristine luxury with our handcrafted, affordable demi-fine jewelry designed for everyday elegance.",
    images: ['/og-image.png'],
  },
  other: {
    "og:logo": "https://indhulya.vercel.app/icon.png"
  }
};

import SmoothScroll from "@/components/SmoothScroll";
import dynamic from "next/dynamic";
import { StoreProvider } from "@/context/StoreContext";
import { Analytics } from "@vercel/analytics/next";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"));
const AdPopup = dynamic(() => import("@/components/AdPopup"), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans text-black bg-[#F7F7F7]" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Indhulya",
              url: "https://indhulya.vercel.app",
              logo: "https://indhulya.vercel.app/icon.png",
              description: "Pristine Luxury. One Gram Gold & Temple Jewellery for everyday elegance.",
            }),
          }}
        />
        <StoreProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <AIChatbot />
          <AdPopup />
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  );
}
