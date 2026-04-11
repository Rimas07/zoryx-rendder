import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FirebaseAnalytics } from "../components/FirebaseAnalytics";
import { LangProvider } from "../contexts/LangContext";
import { InitialLoader } from "../components/InitialLoader";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: "Zoryx — Медицинские клиники в Праге",
  description: "Zoryx — медицинский гид по Праге",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Zoryx — Медицинские клиники в Праге",
    description: "Zoryx — медицинский гид по Праге",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://tile.jawg.io" />
        <link rel="dns-prefetch" href="https://api.mapy.cz" />
      </head>
      <body>
        <InitialLoader />
        <FirebaseAnalytics />
        <LangProvider>
          <main style={{ display: 'contents' }}>{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
