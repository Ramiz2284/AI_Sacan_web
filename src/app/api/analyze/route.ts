import { NextResponse } from "next/server";
import OpenAI from "openai";
import { WATCHLIST_ADDITIVES } from "@/lib/watchlist";
import type { ProductAnalysis, Source } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const userText = body.userText?.trim() ?? "";

    const { externalIngredients, externalSources } = await getExternalIngredients(userText);

    const prompt = buildPrompt({
      watchlist: WATCHLIST_ADDITIVES,
      userText,
      externalIngredients,
      externalSources,
    });

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

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
              text: userText || "Опиши этот товар и состав.",
            },
            {
              type: "input_image",
              image_url: body.imageDataUrl,
              detail: "auto",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          json_schema: {
            name: "product_scan",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                product_name: { type: "string" },
                brand: { type: "string" },
                category: { type: "string" },
                ingredients_found: { type: "boolean" },
                ingredients_text: { type: "string" },
                watchlist_matches: { type: "array", items: { type: "string" } },
                pros: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    ru: { type: "array", items: { type: "string" } },
                    tr: { type: "array", items: { type: "string" } },
                    en: { type: "array", items: { type: "string" } },
                  },
                  required: ["ru", "tr", "en"],
                },
                cons: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    ru: { type: "array", items: { type: "string" } },
                    tr: { type: "array", items: { type: "string" } },
                    en: { type: "array", items: { type: "string" } },
                  },
                  required: ["ru", "tr", "en"],
                },
                summary: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    ru: { type: "string" },
                    tr: { type: "string" },
                    en: { type: "string" },
                  },
                  required: ["ru", "tr", "en"],
                },
                sources: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" },
                      type: {
                        type: "string",
                        enum: ["manufacturer", "database", "retailer", "review"],
                      },
                    },
                    required: ["title", "url", "type"],
                  },
                },
              },
              required: [
                "product_name",
                "brand",
                "category",
                "ingredients_found",
                "ingredients_text",
                "watchlist_matches",
                "pros",
                "cons",
                "summary",
                "sources",
              ],
            },
          },
        },
      },
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
}) {
  const watchlist = params.watchlist.map((item) => `- ${item}`).join("\n");
  const sourcesText = params.externalSources
    .map((source) => `- ${source.title} | ${source.url} | ${source.type}`)
    .join("\n");

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
    const response = await fetch(url);
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
  const searchResponse = await fetch(searchUrl);
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

