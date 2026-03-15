"use client";

import { useEffect, useMemo, useState } from "react";
import ResultCard from "@/components/ResultCard";
import type { ProductAnalysis } from "@/lib/types";
import { saveToHistory } from "@/lib/storage";
import { AppLang, getStoredLang } from "@/lib/i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export default function ScanForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userText, setUserText] = useState("");
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [enhance, setEnhance] = useState(true);
  const [lang, setLang] = useState<AppLang>("ru");

  useEffect(() => {
    setLang(getStoredLang());
  }, []);

  const canSubmit = useMemo(() => !!file && !loading, [file, loading]);

  function handleFileChange(next: File | null) {
    setResult(null);
    setSaved(false);
    setError(null);
    setFile(next);
    if (!next) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const base64 = await fileToDataUrl(file, enhance);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45000);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: base64, userText }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Не удалось получить ответ.");
      }
      const data = (await response.json()) as ProductAnalysis;
      setResult(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Запрос слишком долгий. Попробуйте ещё раз или уменьшите фото.");
      } else {
        setError(err instanceof Error ? err.message : "Ошибка анализа.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!result) return;
    const record = saveToHistory(result);
    setSaved(true);
    setSavedId(record.id);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
        <h2 className="text-xl font-semibold text-neutral-900">
          {lang === "ru" ? "Фото товара" : lang === "tr" ? "Ürün fotoğrafı" : "Product photo"}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {lang === "ru"
            ? "Сделай фото или загрузи изображение. Можно добавить название или бренд."
            : lang === "tr"
            ? "Fotoğraf çek ya da görsel yükle. İstersen marka/isim ekle."
            : "Take a photo or upload an image. You can add name or brand."}
        </p>

        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-white file:hover:bg-neutral-800"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Предпросмотр"
              className="mt-4 h-56 w-full rounded-xl object-cover"
            />
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-600">
          {lang === "ru"
            ? "Подсказка для OCR: сфокусируй камеру на составе, избегай бликов и делай фото поближе."
            : lang === "tr"
            ? "OCR ipucu: içerik kısmına odaklan, yansımadan kaçın ve yakından çek."
            : "OCR tip: focus on ingredients, avoid glare, and shoot closer."}
        </div>

        <label className="mt-4 block text-sm font-medium text-neutral-700">
          {lang === "ru"
            ? "Название / бренд (необязательно)"
            : lang === "tr"
            ? "Ürün adı / marka (opsiyonel)"
            : "Name / brand (optional)"}
        </label>
        <input
          value={userText}
          onChange={(event) => setUserText(event.target.value)}
          placeholder={
            lang === "ru"
              ? "Например: Coca-Cola Zero 0.5L"
              : lang === "tr"
              ? "Örn: Coca-Cola Zero 0.5L"
              : "e.g., Coca-Cola Zero 0.5L"
          }
          className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
        />

        <label className="mt-4 flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={enhance}
            onChange={(event) => setEnhance(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          {lang === "ru"
            ? "Улучшить читаемость состава (контраст)"
            : lang === "tr"
            ? "Okunabilirliği artır (kontrast)"
            : "Improve readability (contrast)"}
        </label>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canSubmit}
          className="tap-feedback mt-6 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {loading
            ? lang === "ru"
              ? "Анализирую..."
              : lang === "tr"
              ? "Analiz ediliyor..."
              : "Analyzing..."
            : lang === "ru"
            ? "Анализировать"
            : lang === "tr"
            ? "Analiz et"
            : "Analyze"}
        </button>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {saved && (
          <p className="mt-4 text-sm text-emerald-700">
            {lang === "ru"
              ? `Сохранено в историю${savedId ? ` (#${savedId.slice(0, 6)})` : ""}.`
              : lang === "tr"
              ? `Geçmişe kaydedildi${savedId ? ` (#${savedId.slice(0, 6)})` : ""}.`
              : `Saved to history${savedId ? ` (#${savedId.slice(0, 6)})` : ""}.`}
          </p>
        )}
      </div>

      <div>
        {result ? (
          <div className="space-y-4">
            <ResultCard data={result} />
            <button
              type="button"
              onClick={handleSave}
              className="tap-feedback w-full rounded-2xl border border-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              {saved
                ? lang === "ru"
                  ? "Сохранено"
                  : lang === "tr"
                  ? "Kaydedildi"
                  : "Saved"
                : lang === "ru"
                ? "Сохранить в историю"
                : lang === "tr"
                ? "Geçmişe kaydet"
                : "Save to history"}
            </button>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white/60 p-12 text-center text-sm text-neutral-500">
            {lang === "ru"
              ? "Результат анализа появится здесь."
              : lang === "tr"
              ? "Analiz sonucu burada görünecek."
              : "Analysis result will appear here."}
          </div>
        )}
      </div>
    </div>
  );
}

async function fileToDataUrl(file: File, enhance: boolean): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Поддерживаются только изображения JPG/PNG/WEBP/HEIC.");
  }

  const rawDataUrl = await readAsDataUrl(file);
  if (!enhance) {
    return downscaleIfNeeded(rawDataUrl);
  }

  try {
    const image = await loadImage(rawDataUrl);
    const { width, height } = getTargetSize(image.width, image.height, 1280);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return rawDataUrl;
    ctx.filter = "contrast(140%) saturate(115%)";
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return downscaleIfNeeded(rawDataUrl);
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось загрузить изображение."));
    img.src = src;
  });
}

async function downscaleIfNeeded(dataUrl: string): Promise<string> {
  try {
    const image = await loadImage(dataUrl);
    const { width, height } = getTargetSize(image.width, image.height, 1280);
    if (width === image.width && height === image.height) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return dataUrl;
  }
}

function getTargetSize(width: number, height: number, maxSize: number) {
  const maxDim = Math.max(width, height);
  if (maxDim <= maxSize) return { width, height };
  const scale = maxSize / maxDim;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
