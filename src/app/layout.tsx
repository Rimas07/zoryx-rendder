import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { LangProvider } from "../contexts/LangContext";
import { A11yProvider } from "../contexts/A11yContext";
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
        <meta name="google-site-verification" content="VRE7U6b8r4SM_Ygrild3yIhTAppx60-rbABMf3HrwFg" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-5Y1SX4H6BM" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5Y1SX4H6BM');
          `}
        </Script>
      </head>
      <body>
        <InitialLoader />
        <A11yProvider>
          <LangProvider>{children}</LangProvider>
        </A11yProvider>
      </body>
    </html>
  );
}
