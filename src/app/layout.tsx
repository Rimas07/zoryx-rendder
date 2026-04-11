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
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      <body>
        <InitialLoader />
        <FirebaseAnalytics />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
