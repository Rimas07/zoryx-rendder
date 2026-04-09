import type { Metadata } from "next";
import { FirebaseAnalytics } from "../components/FirebaseAnalytics";
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
      <meta name="google-site-verification" content="VRE7U6b8r4SM_Ygrild3yIhTAppx60-rbABMf3HrwFg" />
      </head>
      <body>
        <FirebaseAnalytics />
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
