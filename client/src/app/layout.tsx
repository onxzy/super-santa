"use client";
import { Inter } from "next/font/google";
import { Berkshire_Swash } from "next/font/google";
import "./globals.css";
import { APIContext, initAPIContext } from "./APIContext";
import { ToastProvider, ToastContainer } from "./ToastContext";

const berkshireSwash = Berkshire_Swash({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiContext = initAPIContext();
  return (
    <html lang="fr">
      <APIContext.Provider value={apiContext}>
        <ToastProvider>
          <body
            className={`scroll-smooth ${inter.className} ${berkshireSwash.className}`}
          >
            {children}
          </body>
          <ToastContainer />
        </ToastProvider>
      </APIContext.Provider>
    </html>
  );
}
