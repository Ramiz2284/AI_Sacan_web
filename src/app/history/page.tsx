"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HistoryList from "@/components/HistoryList";
import BottomNav from "@/components/BottomNav";
import { AppLang, getStoredLang } from "@/lib/i18n";

export default function HistoryPage() {
  const [lang, setLang] = useState<AppLang>("ru");

  useEffect(() => {
    setLang(getStoredLang());
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f7ff,_#f4f5f7_45%,_#eef2f7_100%)] text-neutral-900">
      <header className="hidden items-center justify-between px-6 py-5 text-sm md:flex">
        <Link href="/" className="font-semibold tracking-wide">
          Aiscan
        </Link>
        <Link href="/scan" className="hover:underline">
          {lang === "ru" ? "Сканировать" : lang === "tr" ? "Tara" : "Scan"}
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-28">
        <HistoryList />
      </main>
      <BottomNav />
    </div>
  );
}
