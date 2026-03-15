"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang, ProductAnalysis } from "@/lib/types";
import { AppLang, getStoredLang } from "@/lib/i18n";

const LANGS: { id: Lang; label: string }[] = [
  { id: "ru", label: "Рус" },
  { id: "tr", label: "Tür" },
  { id: "en", label: "Eng" },
];

export default function ResultCard({ data }: { data: ProductAnalysis }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [uiLang, setUiLang] = useState<AppLang>("ru");

  useEffect(() => {
    setUiLang(getStoredLang());
  }, []);

  const pros = useMemo(() => data.pros[lang] ?? [], [data, lang]);
  const cons = useMemo(() => data.cons[lang] ?? [], [data, lang]);
  const summary = useMemo(() => data.summary[lang] ?? "", [data, lang]);

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {uiLang === "ru" ? "Результат" : uiLang === "tr" ? "Sonuç" : "Result"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
            {data.product_name ||
              (uiLang === "ru" ? "Неизвестный товар" : uiLang === "tr" ? "Bilinmeyen ürün" : "Unknown product")}
          </h2>
          <p className="text-sm text-neutral-600">
            {data.brand && <span>{data.brand}</span>}
            {data.brand && data.category && <span> · </span>}
            {data.category && <span>{data.category}</span>}
          </p>
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
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-700">
            {uiLang === "ru" ? "Плюсы" : uiLang === "tr" ? "Artılar" : "Pros"}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900">
            {pros.length === 0 && (
              <li>{uiLang === "ru" ? "Нет данных о плюсах." : uiLang === "tr" ? "Artı yok." : "No pros found."}</li>
            )}
            {pros.map((item, index) => (
              <li key={`${item}-${index}`}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4">
          <h3 className="text-sm font-semibold text-rose-700">
            {uiLang === "ru" ? "Минусы" : uiLang === "tr" ? "Eksiler" : "Cons"}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-rose-900">
            {cons.length === 0 && (
              <li>{uiLang === "ru" ? "Нет данных о минусах." : uiLang === "tr" ? "Eksi yok." : "No cons found."}</li>
            )}
            {cons.map((item, index) => (
              <li key={`${item}-${index}`}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-700">
          {uiLang === "ru" ? "Сводка" : uiLang === "tr" ? "Özet" : "Summary"}
        </h3>
        <p className="mt-2 text-sm text-neutral-800">
          {summary ||
            (uiLang === "ru"
              ? "Сводка пока недоступна."
              : uiLang === "tr"
              ? "Özet henüz yok."
              : "Summary is not available yet.")}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-700">
            {uiLang === "ru" ? "Состав" : uiLang === "tr" ? "İçerik" : "Ingredients"}
          </h3>
          <p className="mt-2 text-sm text-neutral-800">
            {data.ingredients_found
              ? data.ingredients_text ||
                (uiLang === "ru"
                  ? "Состав указан, но не распознан полностью."
                  : uiLang === "tr"
                  ? "İçerik var ama tam okunamadı."
                  : "Ingredients found but not fully recognized.")
              : uiLang === "ru"
              ? "Состав не найден."
              : uiLang === "tr"
              ? "İçerik bulunamadı."
              : "Ingredients not found."}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-700">
            {uiLang === "ru" ? "Нежелательные добавки" : uiLang === "tr" ? "İstenmeyen katkılar" : "Watchlist additives"}
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-neutral-800">
            {data.watchlist_matches.length === 0 && (
              <li>{uiLang === "ru" ? "Не обнаружены." : uiLang === "tr" ? "Bulunmadı." : "None found."}</li>
            )}
            {data.watchlist_matches.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-700">
          {uiLang === "ru" ? "Источники" : uiLang === "tr" ? "Kaynaklar" : "Sources"}
        </h3>
        <ul className="mt-2 space-y-2 text-sm text-neutral-700">
          {data.sources.length === 0 && (
            <li>{uiLang === "ru" ? "Источники не указаны." : uiLang === "tr" ? "Kaynak yok." : "No sources listed."}</li>
          )}
          {data.sources.map((item) => (
            <li key={`${item.title}-${item.url}`}>
              {item.title} · {item.type}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
