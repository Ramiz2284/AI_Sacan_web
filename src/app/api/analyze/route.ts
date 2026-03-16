import { NextResponse } from "next/server";
import OpenAI from "openai";
import { WATCHLIST_ADDITIVES } from "@/lib/watchlist";
import type { ProductAnalysis, Source } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_IMAGE_CHARS = 6_000_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      imageDataUrl?: string;
      userText?: string;
    };

    if (!body?.imageDataUrl) {
      return NextResponse.json({ error: "Missing imageDataUrl" }, { status: 400 });
    }
    if (body.imageDataUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json(
        { error: "Image is too large. Please use a smaller photo." },
        { status: 413 }
      );
    }
    if (!body.imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const userText = body.userText?.trim() ?? "";

    const { externalIngredients, externalSources } = await getExternalIngredients(userText);

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const productHint = await detectProduct({
      model,
      imageDataUrl: body.imageDataUrl,
      userText,
    });

    const prompt = buildPrompt({
      watchlist: WATCHLIST_ADDITIVES,
      userText,
      externalIngredients,
      externalSources,
      productHint,
    });

    const response = await openai.responses.create({
      model,
      tools: [{ type: "web_search" }],
      input: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Найди отзывы через web_search и сформируй итоговый JSON по схеме. Если отзывов нет, так и укажи.",
            },
            {
              type: "input_image",
              image_url: body.imageDataUrl,
              detail: "high",
            },
          ],
        },
      ],
      temperature: 0.2,
    });

    const outputText = response.output_text;
    if (!outputText) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const parsed = parseModelJson(outputText);
    if (!parsed) {
      return NextResponse.json(
        { error: "Model output is not valid JSON", raw: outputText },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPrompt(params: {
  watchlist: string[];
  userText: string;
  externalIngredients: string | null;
  externalSources: Source[];
  productHint: { product_name: string; brand: string; category: string } | null;
}) {
  const watchlist = params.watchlist.map((item) => `- ${item}`).join("\n");
  const sourcesText = params.externalSources
    .map((source) => `- ${source.title} | ${source.url} | ${source.type}`)
    .join("\n");

  const hintText = params.productHint
    ? `product_name: ${params.productHint.product_name}\nbrand: ${params.productHint.brand}\ncategory: ${params.productHint.category}\n`
    : "";

  return `Ты — ассистент анализа товаров по фото.

Вход:
- Фото товара (упаковка, этикетка, штрих‑код, состав)
- Опционально: текст пользователя
- Опционально: external_ingredients и external_sources (если найдены сервером)

Задачи:
1) Определи товар: название, бренд, категория.
2) Найди состав.
   - Сначала считай с фото.
   - Если состава на фото нет или он неполный, используй external_ingredients.
   - Если состава нет нигде — честно укажи “состав не найден”.
3) Сверь состав с WATCHLIST_ADDITIVES и перечисли совпадения.
4) Сформируй краткую выжимку отзывов: 3–5 плюсов и 3–5 минусов в стиле “люди отмечают…”, без выдуманных цитат.
   Используй web_search для поиска отзывов и укажи источники в поле sources (type: review).
5) Итог: 1–2 предложения резюме.

Правила:
- Не выдумывай состав.
- Если данные противоречат, приоритет: официальный сайт производителя > официальные базы > крупные ретейлеры > открытые базы.
- Языки ответа: русский, турецкий, английский.

WATCHLIST_ADDITIVES:
${watchlist}

external_ingredients:
${params.externalIngredients ?? ""}

external_sources:
${sourcesText}

product_hint:
${hintText}

Выход строго JSON, без markdown и без обертки в кодовый блок:
{
  "product_name": "",
  "brand": "",
  "category": "",
  "ingredients_found": true/false,
  "ingredients_text": "",
  "watchlist_matches": [],
  "pros": {"ru":[], "tr":[], "en":[]},
  "cons": {"ru":[], "tr":[], "en":[]},
  "summary": {"ru":"", "tr":"", "en":""},
  "sources": [{"title":"", "url":"", "type":"manufacturer|database|retailer|review"}]
}

Текст пользователя: ${params.userText || "(нет)"}`;
}

async function detectProduct(params: {
  model: string;
  imageDataUrl: string;
  userText: string;
}): Promise<{ product_name: string; brand: string; category: string } | null> {
  const response = await openai.responses.create({
    model: params.model,
    input: [
      {
        role: "system",
        content:
          "Определи товар по фото. Верни ТОЛЬКО JSON без markdown: {\"product_name\":\"\",\"brand\":\"\",\"category\":\"\"}",
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: params.userText || "Определи товар на фото.",
          },
          {
            type: "input_image",
            image_url: params.imageDataUrl,
            detail: "high",
          },
        ],
      },
    ],
    temperature: 0.1,
  });
  const text = response.output_text;
  if (!text) return null;
  const parsed = parseModelJson(text) as
    | { product_name?: string; brand?: string; category?: string }
    | null;
  if (!parsed) return null;
  return {
    product_name: parsed.product_name ?? "",
    brand: parsed.brand ?? "",
    category: parsed.category ?? "",
  };
}

function parseModelJson(text: string): ProductAnalysis | null {
  if (!text) return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```$/i, "");
  cleaned = cleaned.replace(/```$/m, "");
  if (cleaned.toLowerCase().startsWith("json")) {
    cleaned = cleaned.replace(/^json\s*/i, "");
  }
  try {
    return JSON.parse(cleaned) as ProductAnalysis;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = cleaned.slice(start, end + 1);
      try {
        return JSON.parse(slice) as ProductAnalysis;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function getExternalIngredients(userText: string): Promise<{
  externalIngredients: string | null;
  externalSources: Source[];
}> {
  if (!userText) {
    return { externalIngredients: null, externalSources: [] };
  }

  const barcodeMatch = userText.match(/\b\d{8,14}\b/);
  if (barcodeMatch) {
    const barcode = barcodeMatch[0];
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,ingredients_text,ingredients_text_en,ingredients_text_ru,ingredients_text_tr,categories,code`;
    const response = await fetchWithTimeout(url, 8000);
    if (response.ok) {
      const data = await response.json();
      if (data?.product) {
        const ingredients =
          data.product.ingredients_text_ru ||
          data.product.ingredients_text_en ||
          data.product.ingredients_text_tr ||
          data.product.ingredients_text ||
          null;
        if (ingredients) {
          return {
            externalIngredients: ingredients,
            externalSources: [
              {
                title: data.product.product_name || "Open Food Facts",
                url: `https://world.openfoodfacts.org/product/${barcode}`,
                type: "database",
              },
            ],
          };
        }
      }
    }
  }

  const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    userText
  )}&search_simple=1&action=process&json=1&page_size=1`;
  const searchResponse = await fetchWithTimeout(searchUrl, 8000);
  if (!searchResponse.ok) {
    return { externalIngredients: null, externalSources: [] };
  }
  const searchData = await searchResponse.json();
  const product = searchData?.products?.[0];
  if (!product) {
    return { externalIngredients: null, externalSources: [] };
  }
  const ingredients =
    product.ingredients_text_ru ||
    product.ingredients_text_en ||
    product.ingredients_text_tr ||
    product.ingredients_text ||
    null;
  if (!ingredients) {
    return { externalIngredients: null, externalSources: [] };
  }

  return {
    externalIngredients: ingredients,
    externalSources: [
      {
        title: product.product_name || "Open Food Facts",
        url: `https://world.openfoodfacts.org/product/${product.code}`,
        type: "database",
      },
    ],
  };
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || now > current.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) return false;
  current.count += 1;
  return true;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

