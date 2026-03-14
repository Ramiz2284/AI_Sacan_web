"use client";

import { useMemo, useState } from "react";
import type { Lang, ProductAnalysis } from "@/lib/types";

const LANGS: { id: Lang; label: string }[] = [
  { id: "ru", label: "Рус" },
  { id: "tr", label: "Tür" },
  { id: "en", label: "Eng" },
];

export default function ResultCard({ data }: { data: ProductAnalysis }) {
  const [lang, setLang] = useState<Lang>("ru");

  const pros = useMemo(() => data.pros[lang] ?? [], [data, lang]);
  const cons = useMemo(() => data.cons[lang] ?? [], [data, lang]);
  const summary = useMemo(() => data.summary[lang] ?? "", [data, lang]);

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Результат</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
            {data.product_name || "Неизвестный товар"}
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
          <h3 className="text-sm font-semibold text-emerald-700">Плюсы</h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900">
            {pros.length === 0 && <li>Нет данных о плюсах.</li>}
            {pros.map((item, index) => (
              <li key={`${item}-${index}`}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4">
          <h3 className="text-sm font-semibold text-rose-700">Минусы</h3>
          <ul className="mt-3 space-y-2 text-sm text-rose-900">
            {cons.length === 0 && <li>Нет данных о минусах.</li>}
            {cons.map((item, index) => (
              <li key={`${item}-${index}`}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-700">Сводка</h3>
        <p className="mt-2 text-sm text-neutral-800">
          {summary || "Сводка пока недоступна."}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-700">Состав</h3>
          <p className="mt-2 text-sm text-neutral-800">
            {data.ingredients_found
              ? data.ingredients_text || "Состав указан, но не распознан полностью."
              : "Состав не найден."}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-700">Нежелательные добавки</h3>
          <ul className="mt-2 space-y-2 text-sm text-neutral-800">
            {data.watchlist_matches.length === 0 && <li>Не обнаружены.</li>}
            {data.watchlist_matches.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-700">Источники</h3>
        <ul className="mt-2 space-y-2 text-sm text-neutral-700">
          {data.sources.length === 0 && <li>Источники не указаны.</li>}
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
