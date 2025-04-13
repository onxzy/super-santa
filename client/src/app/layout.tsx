"use client";
import { useContext } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Berkshire_Swash } from "next/font/google";
import "./globals.css";
import { APIContext, initAPIContext } from "./APIContext";
import { ToastProvider, ToastContext } from "./ToastContext";
import Toast from "@/components/ui/Toast";

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
        <ToastProvider>
          <body className={inter.className}>
            <ToastContainer />
            {children}
          </body>
        </ToastProvider>
      </APIContext.Provider>
    </html>
  );
}

function ToastContainer() {
  const { toast, hideToast } = useContext(ToastContext);

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
      id={toast.id}
    />
  );
}
