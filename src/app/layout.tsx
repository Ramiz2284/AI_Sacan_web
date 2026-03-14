import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

export const metadata: Metadata = {
  title: "Aiscan — умный сканер продуктов",
  description:
    "Сканируйте товары, находите состав, нежелательные добавки и сводку отзывов на трех языках.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
