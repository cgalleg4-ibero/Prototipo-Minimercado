import type { Metadata } from "next";
import { Source_Sans_3, Fraunces } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minimercado — Inventario y ventas",
  description:
    "Prototipo de gestión de inventario, ventas y reportes para minimercados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sourceSans.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
