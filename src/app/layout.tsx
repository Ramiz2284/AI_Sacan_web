import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

const notoSans = Noto_Sans({
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
      <body className={`${notoSerif.variable} ${notoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
