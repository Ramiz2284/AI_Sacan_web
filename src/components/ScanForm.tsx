"use client";

import { useEffect, useRef, useState } from "react";
import ResultCard from "@/components/ResultCard";
import type { ProductAnalysis } from "@/lib/types";
import { saveToHistory } from "@/lib/storage";
import { AppLang, getStoredLang } from "@/lib/i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export default function ScanForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [enhance, setEnhance] = useState(true);
  const [lang, setLang] = useState<AppLang>("ru");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLang(getStoredLang());
  }, []);

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
    void handleAnalyze(next);
  }

  async function handleAnalyze(forcedFile?: File) {
    const fileToSend = forcedFile ?? file;
    if (!fileToSend) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const base64 = await fileToDataUrl(fileToSend, enhance);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 45000);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: base64, userText: "" }),
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
      {loading && (
        <div className="scan-overlay">
          <div className="scan-panel">
            <div className="relative mx-auto mb-6 h-40 w-40">
              <div className="scan-glow" />
              <div className="scan-orbit" />
              <div className="scan-orbit second" />
              <svg
                viewBox="0 0 200 200"
                className="relative z-10 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="brain" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <path
                  d="M62 60c-10 2-18 10-20 20-10 2-18 12-18 24 0 14 10 26 24 28 2 10 12 18 24 18h18c10 0 18-8 18-18V90c0-18-14-34-32-34-4 0-8 1-14 4z"
                  fill="url(#brain)"
                  opacity="0.9"
                />
                <path
                  d="M138 60c10 2 18 10 20 20 10 2 18 12 18 24 0 14-10 26-24 28-2 10-12 18-24 18h-18c-10 0-18-8-18-18V90c0-18 14-34 32-34 4 0 8 1 14 4z"
                  fill="url(#brain)"
                  opacity="0.9"
                />
                <path
                  d="M70 90h20m-10 16h22m-18 16h20m20-32h20m-10 16h22m-18 16h20"
                  stroke="white"
                  strokeOpacity="0.6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="scan-wave" />
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-sky-200">
              {lang === "ru"
                ? "Сканирую"
                : lang === "tr"
                ? "Taranıyor"
                : "Scanning"}
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {lang === "ru"
                ? "Ищу состав и отзывы…"
                : lang === "tr"
                ? "İçerik ve yorumlar aranıyor…"
                : "Finding ingredients and reviews…"}
            </p>
          </div>
        </div>
      )}
      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
        <h2 className="text-xl font-semibold text-neutral-900">
          {lang === "ru" ? "Фото товара" : lang === "tr" ? "Ürün fotoğrafı" : "Product photo"}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {lang === "ru"
            ? "Нажми «Сканировать», чтобы сделать фото товара."
            : lang === "tr"
            ? "Ürünün fotoğrafını çekmek için «Tara»ya bas."
            : "Tap “Scan” to take a product photo."}
        </p>

        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="tap-feedback w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            {lang === "ru" ? "Сканировать" : lang === "tr" ? "Tara" : "Scan"}
          </button>
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

        {loading && (
          <div className="mt-6 rounded-2xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white">
            {lang === "ru"
              ? "Анализирую..."
              : lang === "tr"
              ? "Analiz ediliyor..."
              : "Analyzing..."}
          </div>
        )}

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
