"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLang, getStoredLang } from "@/lib/i18n";

const LABELS: Record<AppLang, { home: string; scan: string; history: string }> = {
  ru: { home: "???????", scan: "????", history: "???????" },
  tr: { home: "Ana", scan: "Tara", history: "Geçmis" },
  en: { home: "Home", scan: "Scan", history: "History" },
};

const navIcons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  scan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect
        x="7"
        y="8"
        width="10"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  ),
  history: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h10l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
};

export default function BottomNav() {
  const pathname = usePathname();
  const [lang, setLang] = useState<AppLang>("ru");

  useEffect(() => {
    setLang(getStoredLang());
    const handleLangChange = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === "ru" || detail === "tr" || detail === "en") {
        setLang(detail);
      } else {
        setLang(getStoredLang());
      }
    };
    window.addEventListener("aiscan_lang_change", handleLangChange);
    return () => window.removeEventListener("aiscan_lang_change", handleLangChange);
  }, []);

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {(
        [
          { href: "/", label: LABELS[lang].home, icon: navIcons.home },
          { href: "/scan", label: LABELS[lang].scan, icon: navIcons.scan },
          { href: "/history", label: LABELS[lang].history, icon: navIcons.history },
        ] as const
      ).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
