import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from './context/LanguageContext';

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lumière Dermatology | Premium Skincare & Aesthetic Medicine",
  description: "Experience luxury dermatology and aesthetic treatments at Lumière. Expert skincare, anti-aging solutions, and personalized beauty treatments in an elegant, serene environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
