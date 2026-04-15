import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { LangProvider } from "../contexts/LangContext";
import { A11yProvider } from "../contexts/A11yContext";
import { InitialLoader } from "../components/InitialLoader";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title:
    "Zoryx — Medical Clinics in Prague · Клиники в Праге · Kliniky v Praze",
  description:
    "Find medical clinics in Prague · Медицинские клиники в Праге — поиск по специализации, языку и району · Lékařské kliniky v Praze dle specializace a jazyka",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Zoryx — Medical Clinics in Prague",
    description:
      "Find medical clinics in Prague by specialization, language and district.",
    url: "https://web.zoryx.app",
    siteName: "Zoryx",
    type: "website",
    images: [
      
      {
        url: "https://web.zoryx.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zoryx — Medical Clinics in Prague",
      },
    ],
  },
  alternates: {
    canonical: "https://web.zoryx.app",
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
