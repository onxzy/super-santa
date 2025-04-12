import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { Berkshire_Swash } from "next/font/google";
import "./globals.css";
import { APIContext, initAPIContext} from "./APIContext";
import { init } from "next/dist/compiled/webpack/webpack";


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
  const apiContext = initAPIContext();
  return (
    
    <html lang="en" className="scroll-smooth">
      <APIContext value={apiContext}>
        <body
          className={``}
        >
          {children}
        </body>
      </APIContext>
    </html>
  );
}
