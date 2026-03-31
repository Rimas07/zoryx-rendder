import type { Metadata } from "next";
import { LangProvider } from "../contexts/LangContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoryx — Медицинские клиники в Праге",
  description: "Zoryx — медицинский гид по Праге",
  icons: {
    icon: "/ZORYX LOGO .png",
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
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
