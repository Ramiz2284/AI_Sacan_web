"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScanForm from "@/components/ScanForm";
import BottomNav from "@/components/BottomNav";
import { AppLang, getStoredLang } from "@/lib/i18n";

export default function ScanPage() {
  const [lang, setLang] = useState<AppLang>("ru");

  useEffect(() => {
    setLang(getStoredLang());
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fefcf6,_#f5f5f4_45%,_#e7ecf3_100%)] text-neutral-900">
      <header className="hidden items-center justify-between px-6 py-5 text-sm md:flex">
        <Link href="/" className="font-semibold tracking-wide">
          Aiscan
        </Link>
        <Link href="/history" className="hover:underline">
          {lang === "ru" ? "История" : lang === "tr" ? "Geçmiş" : "History"}
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-28">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold">
            {lang === "ru" ? "Сканирование товара" : lang === "tr" ? "Ürün tarama" : "Product scan"}
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            {lang === "ru"
              ? "Сделайте снимок упаковки, чтобы найти состав, нежелательные добавки и краткую выжимку отзывов."
              : lang === "tr"
              ? "Paketin fotoğrafını çekin; içerik, istenmeyen katkılar ve kısa yorum özeti bulalım."
              : "Take a photo of the package to find ingredients, watchlist additives, and a short review summary."}
          </p>
        </div>
        <ScanForm />
      </main>
      <BottomNav />
    </div>
  );
}
