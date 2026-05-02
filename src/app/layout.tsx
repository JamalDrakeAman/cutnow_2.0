import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CutNow – Kein unnötiges Warten",
  description: "Live-Warteschlange für Barbershops. Sieh sofort, wer verfügbar ist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-neutral-950 text-white">{children}</body>
    </html>
  );
}
