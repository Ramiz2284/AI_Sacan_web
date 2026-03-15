"use client";

import { useEffect, useMemo, useState } from "react";
import type { HistoryRecord } from "@/lib/types";
import { clearHistory, exportHistory, getHistory, importHistory, removeFromHistory } from "@/lib/storage";

function groupByCategory(items: HistoryRecord[]) {
  return items.reduce<Record<string, HistoryRecord[]>>((acc, item) => {
    const key = item.category?.trim() || "Без категории";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function HistoryList() {
  const [items, setItems] = useState<HistoryRecord[]>([]);
  const [query, setQuery] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.product_name, item.brand, item.category]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [items, query]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  async function handleImport(file: File | null) {
    if (!file) return;
    const text = await file.text();
    const result = importHistory(text);
    setItems(getHistory());
    setImportMessage(`Импортировано: ${result.added}, всего записей: ${result.total}.`);
    setClearMessage(null);
  }

  function handleRemove(id: string) {
    removeFromHistory(id);
    setItems(getHistory());
  }

  function handleClearAll() {
    clearHistory();
    setItems([]);
    setClearMessage("История очищена.");
  }

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">История</h2>
          <p className="text-sm text-neutral-600">
            История хранится только в браузере. Экспортируй файл, чтобы перенести на другое устройство.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportHistory()}
            className="tap-feedback rounded-full border border-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            Экспорт
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="tap-feedback rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white"
          >
            Очистить всё
          </button>
          <label className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800">
            Импорт
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <div className="mt-6">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию или бренду"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
        />
      </div>

      {importMessage && (
        <p className="mt-4 text-sm text-emerald-700">{importMessage}</p>
      )}
      {clearMessage && (
        <p className="mt-4 text-sm text-rose-600">{clearMessage}</p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
          История пока пуста.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(grouped).map(([category, records]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {category}
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {records.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4"
                  >
                    <p className="text-xs text-neutral-500">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-neutral-900">
                      {record.product_name || "Без названия"}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      {record.brand && <span>{record.brand}</span>}
                      {record.brand && record.category && <span> · </span>}
                      {record.category && <span>{record.category}</span>}
                    </p>
                    <p className="mt-3 text-sm text-neutral-700">
                      {record.summary.ru || record.summary.en || "Сводка отсутствует."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(record.id)}
                      className="tap-feedback mt-4 text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Удалить
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
