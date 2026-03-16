import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-fraunces",
  subsets: ["latin", "cyrillic"],
});

const notoSans = Noto_Sans({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Aiscan — умный сканер продуктов",
  description:
    "Сканируйте товары, находите состав, нежелательные добавки и сводку отзывов на трех языках.",
  metadataBase: new URL("https://aisacanweb.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aiscan — умный сканер продуктов",
    description:
      "Сканируйте товары, находите состав, нежелательные добавки и сводку отзывов на трех языках.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Aiscan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aiscan — умный сканер продуктов",
    description:
      "Сканируйте товары, находите состав, нежелательные добавки и сводку отзывов на трех языках.",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${notoSerif.variable} ${notoSans.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var v=localStorage.getItem('aiscan_lang');if(v==='ru'||v==='tr'||v==='en'){document.documentElement.lang=v;}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
