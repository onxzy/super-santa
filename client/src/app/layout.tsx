import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { Berkshire_Swash } from "next/font/google";
import "./globals.css";

const berkshireSwash = Berkshire_Swash({
  variable: "--font-berkshire-swash",
  weight: ["400"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en">
      <body
        className={`${inter.variable} ${berkshireSwash.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
