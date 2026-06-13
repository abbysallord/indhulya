import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INDHULYA | Demifine Jewellery | 18k thick Gold Plated - Shop Now",
  description: "Shop for demifine jewellery pieces for your everyday use from INDHULYA. Bracelets, necklaces, rings, earrings, mangalsutras and much more. waterproof, tarnishproof and hypoallergenic jewellery. Affordable luxury jewellery for everyday.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-black bg-[#F7F7F7]">{children}</body>
    </html>
  );
}
