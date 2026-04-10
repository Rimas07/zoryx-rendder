import type { Metadata } from "next";
import Script from "next/script";
import { LangProvider } from "../contexts/LangContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoryx — Медицинские клиники в Праге",
  description: "Zoryx — медицинский гид по Праге",
  icons: {
    icon: "https://gsprqyfmodotiezvopiq.supabase.co/storage/v1/object/public/fdsfds/unnamed.jpg",
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
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="VRE7U6b8r4SM_Ygrild3yIhTAppx60-rbABMf3HrwFg"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5Y1SX4H6BM"
          strategy="afterInteractive"
        />
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
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
