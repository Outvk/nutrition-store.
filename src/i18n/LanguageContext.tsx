"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/** Synchronously stamps dir/lang/class on <html>. Safe to call client-side only. */
function stampHTML(locale: Locale) {
  const isAr = locale === "ar";
  document.documentElement.lang = locale;
  document.documentElement.dir = isAr ? "rtl" : "ltr";
  // Class-based selector is the production-safe mechanism:
  // html[dir] alone can lag behind React hydration in SSR environments.
  document.documentElement.classList.toggle("rtl-mode", isAr);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  // Restore saved locale on first paint
  useEffect(() => {
    const saved = localStorage.getItem("nutrition_locale") as Locale;
    const valid: Locale = saved === "fr" || saved === "ar" ? saved : "fr";
    setLocaleState(valid);
    stampHTML(valid);
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("nutrition_locale", newLocale);
    stampHTML(newLocale);
  };

  const t = (path: string): any => {
    const keys = path.split(".");
    let result: any = translations[locale];
    for (const key of keys) {
      if (result == null || result[key] === undefined) return path;
      result = result[key];
    }
    return result;
  };

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dir, t }}>
      {/* dir on this wrapper propagates to all child components automatically,
          giving proper RTL text cursor, flex-start/end, etc. without JS */}
      <div dir={dir} style={{ visibility: mounted ? "visible" : "hidden", width: "100%" }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
