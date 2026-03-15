"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { setStoredLang } from "@/lib/i18n";

type HomeLang = "ru" | "tr" | "en";

const COPY: Record<
  HomeLang,
  {
    badge: string;
    title: string;
    subtitle: string;
    scan: string;
    history: string;
    panelTitle: string;
    panelItems: string[];
    panelNote: string;
    cards: { title: string; text: string }[];
  }
> = {
  ru: {
    badge: "умный сканер продуктов",
    title: "Узнай состав, риски и отзывы за пару секунд",
    subtitle:
      "Сфотографируй товар, а мы найдём состав, выделим нежелательные добавки и соберём короткую выжимку отзывов на трёх языках.",
    scan: "Сканировать",
    history: "Открыть историю",
    panelTitle: "Что внутри",
    panelItems: [
      "Состав и потенциально нежелательные добавки.",
      "Короткая сводка отзывов: плюсы и минусы.",
      "История товаров по категориям с экспортом.",
    ],
    panelNote:
      "Всё хранится локально в браузере, данные можно переносить через экспорт.",
    cards: [
      { title: "3 языка", text: "Результаты на русском, турецком и английском." },
      { title: "Честные источники", text: "Приоритет официальным сайтам и базам продуктов." },
      { title: "Без регистрации", text: "Никаких аккаунтов и баз данных — всё у тебя." },
    ],
  },
  tr: {
    badge: "akıllı ürün tarayıcı",
    title: "İçerik, risk ve yorumları saniyeler içinde öğren",
    subtitle:
      "Ürünün fotoğrafını çek, biz içerikleri bulalım, şüpheli katkıları ayıklayalım ve üç dilde kısa yorum özeti hazırlayalım.",
    scan: "Tara",
    history: "Geçmişi aç",
    panelTitle: "İçerik",
    panelItems: [
      "İçerik ve potansiyel olarak istenmeyen katkılar.",
      "Kısa yorum özeti: artılar ve eksiler.",
      "Kategorilere göre geçmiş ve dışa aktarma.",
    ],
    panelNote: "Her şey tarayıcıda saklanır, dışa aktarımla taşınabilir.",
    cards: [
      { title: "3 dil", text: "Rusça, Türkçe ve İngilizce sonuçlar." },
      { title: "Güvenilir kaynaklar", text: "Öncelik resmi siteler ve veri tabanları." },
      { title: "Kayıt yok", text: "Hesap yok, veritabanı yok — sadece sende." },
    ],
  },
  en: {
    badge: "smart product scanner",
    title: "Find ingredients, risks, and reviews in seconds",
    subtitle:
      "Snap a photo and we’ll detect ingredients, flag watchlist additives, and summarize reviews in three languages.",
    scan: "Scan",
    history: "Open history",
    panelTitle: "What you get",
    panelItems: [
      "Ingredients and potentially unwanted additives.",
      "Short review summary: pros and cons.",
      "Category-based history with export.",
    ],
    panelNote: "Everything is stored locally in your browser and exportable.",
    cards: [
      { title: "3 languages", text: "Results in Russian, Turkish, and English." },
      { title: "Trusted sources", text: "Priority to official sites and databases." },
      { title: "No sign-up", text: "No accounts, no databases — it’s all yours." },
    ],
  },
};

const LANGS: { id: HomeLang; label: string }[] = [
  { id: "ru", label: "Рус" },
  { id: "tr", label: "Tür" },
  { id: "en", label: "Eng" },
];

export default function HomePage() {
  const [lang, setLang] = useState<HomeLang>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem("aiscan_lang");
    if (stored === "ru" || stored === "tr" || stored === "en") {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    setStoredLang(lang);
  }, [lang]);

  const copy = useMemo(() => COPY[lang], [lang]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff7e6,_#f3f4f6_45%,_#e8edf5_100%)] text-neutral-900">
      <div className="glow-orb float-slower -left-20 top-10 h-56 w-56 bg-amber-200" />
      <div className="glow-orb float-slow right-10 top-24 h-64 w-64 bg-emerald-200" />
      <div className="glow-orb float-slower right-24 top-80 h-40 w-40 bg-sky-200" />
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-wide">
            Aiscan
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/scan" className="hover:underline">
              {copy.scan}
            </Link>
            <Link href="/history" className="hover:underline">
              {copy.history}
            </Link>
          </nav>
        </div>
        <div className="flex rounded-full border border-neutral-200 bg-white">
          {LANGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLang(item.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                lang === item.id
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-28 pt-2">
        <section className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="glass-panel fade-in rounded-[40px] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              {copy.badge}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-neutral-600">{copy.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/scan"
                className="tap-feedback rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-20px_rgba(0,0,0,0.7)] transition hover:scale-[1.02] hover:bg-neutral-800"
              >
                <span className="text-white">{copy.scan}</span>
              </Link>
              <Link
                href="/history"
                className="tap-feedback rounded-full border border-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
              >
                {copy.history}
              </Link>
            </div>
          </div>

          <div className="glass-dark fade-in-delay relative overflow-hidden rounded-[40px] p-8 text-white">
            <div className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-emerald-400/40 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-amber-300/40 blur-3xl" />
            <h2 className="text-xl font-semibold">{copy.panelTitle}</h2>
            <ul className="mt-6 space-y-4 text-sm text-neutral-200">
              {copy.panelItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-[pulse_3s_ease-in-out_infinite] rounded-full bg-white/60" />
            </div>
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-xs text-neutral-200">
              {copy.panelNote}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {copy.cards.map((item) => (
            <div
              key={item.title}
              className="glass-panel card-float rounded-3xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                  {item.title === "3 языка" || item.title === "3 dil" || item.title === "3 languages" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                      <path d="M4 5h16M8 5v14m0 0h8m-8 0l4-7 4 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : item.title === "Честные источники" || item.title === "Güvenilir kaynaklar" || item.title === "Trusted sources" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                      <path d="M12 4l7 3v5c0 4.2-3.1 7.1-7 8-3.9-.9-7-3.8-7-8V7l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                      <path d="M9.5 12.5l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                      <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <rect x="6" y="11" width="12" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.6"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
              </div>
              <p className="mt-3 text-sm text-neutral-600">{item.text}</p>
            </div>
          ))}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
