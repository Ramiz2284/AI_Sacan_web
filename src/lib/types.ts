export type Lang = "ru" | "tr" | "en";

export type MultiLangList = {
  ru: string[];
  tr: string[];
  en: string[];
};

export type MultiLangText = {
  ru: string;
  tr: string;
  en: string;
};

export type SourceType = "manufacturer" | "database" | "retailer" | "review";

export type Source = {
  title: string;
  url: string;
  type: SourceType;
};

export type ProductAnalysis = {
  product_name: string;
  brand: string;
  category: string;
  ingredients_found: boolean;
  ingredients_text: string;
  watchlist_matches: string[];
  pros: MultiLangList;
  cons: MultiLangList;
  summary: MultiLangText;
  sources: Source[];
};

export type HistoryRecord = ProductAnalysis & {
  id: string;
  created_at: string;
};

