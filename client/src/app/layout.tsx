import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { Berkshire_Swash } from "next/font/google";
import "./globals.css";

const berkshireSwash = Berkshire_Swash({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rudolphe",
  description: "Pour vos amis, des cadeaux incognito",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={``}
      >
        {children}
      </body>
    </html>
  );
}
