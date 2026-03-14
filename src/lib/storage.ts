"use client";

import type { HistoryRecord, ProductAnalysis } from "@/lib/types";

const STORAGE_KEY = "product_history_v1";

export function getHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveToHistory(record: ProductAnalysis): HistoryRecord {
  const history = getHistory();
  const newRecord: HistoryRecord = {
    ...record,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const next = [newRecord, ...history];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return newRecord;
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportHistory() {
  const data = JSON.stringify(getHistory(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `product_history_${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importHistory(raw: string): { added: number; total: number } {
  const current = getHistory();
  let incoming: HistoryRecord[] = [];
  try {
    incoming = JSON.parse(raw) as HistoryRecord[];
  } catch {
    return { added: 0, total: current.length };
  }
  if (!Array.isArray(incoming)) {
    return { added: 0, total: current.length };
  }
  const existingIds = new Set(current.map((item) => item.id));
  const merged = [...current];
  let added = 0;
  for (const item of incoming) {
    if (!item?.id || existingIds.has(item.id)) continue;
    merged.push(item);
    existingIds.add(item.id);
    added += 1;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return { added, total: merged.length };
}

