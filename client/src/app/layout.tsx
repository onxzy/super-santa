"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Berkshire_Swash } from "next/font/google";
import "./globals.css";
import { APIContext, initAPIContext } from "./APIContext";

const berkshireSwash = Berkshire_Swash({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiContext = initAPIContext();
  return (
    <html lang="en" className="scroll-smooth">
      <APIContext.Provider value={apiContext}>
        <body>{children}</body>
      </APIContext.Provider>
    </html>
  );
}
