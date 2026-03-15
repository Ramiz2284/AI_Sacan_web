export type AppLang = "ru" | "tr" | "en";

export function isAppLang(value: string | null): value is AppLang {
  return value === "ru" || value === "tr" || value === "en";
}

export function getStoredLang(): AppLang {
  if (typeof window === "undefined") return "ru";
  const stored = window.localStorage.getItem("aiscan_lang");
  return isAppLang(stored) ? stored : "ru";
}
