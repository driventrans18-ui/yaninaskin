import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from './context/LanguageContext';
import Analytics from './components/Analytics';

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
  title: "Skin Beauty by Yanina Menaker",
  description: "Skin Beauty by Yanina Menaker — licensed esthetician offering personalised facials, chemical peels, and results-driven skincare treatments.",
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
        <Analytics />
      </body>
    </html>
  );
}
