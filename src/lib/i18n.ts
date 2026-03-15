export type AppLang = "ru" | "tr" | "en";

export function isAppLang(value: string | null): value is AppLang {
  return value === "ru" || value === "tr" || value === "en";
}

export function getStoredLang(): AppLang {
  if (typeof window === "undefined") return "ru";
  const stored = window.localStorage.getItem("aiscan_lang");
  if (isAppLang(stored)) return stored;

  const device = getDeviceLang();
  window.localStorage.setItem("aiscan_lang", device);
  return device;
}

export function setStoredLang(lang: AppLang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("aiscan_lang", lang);
  window.dispatchEvent(new CustomEvent("aiscan_lang_change", { detail: lang }));
}

function getDeviceLang(): AppLang {
  if (typeof navigator === "undefined") return "ru";
  const raw = navigator.language?.toLowerCase() ?? "";
  if (raw.startsWith("ru")) return "ru";
  if (raw.startsWith("tr")) return "tr";
  if (raw.startsWith("en")) return "en";
  return "en";
}
