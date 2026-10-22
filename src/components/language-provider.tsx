"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translateHome, type HomeMessageKey } from "@/i18n/home-messages";
import { languageFromSession, type AppLanguage } from "@/lib/language";

type I18n = {
  lang: AppLanguage;
  t: (key: HomeMessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18n>({
  lang: "en",
  t: (key, vars) => translateHome("en", key, vars),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<AppLanguage>("en");

  useEffect(() => {
    const apply = () => {
      const next = languageFromSession();
      setLang(next);
      document.documentElement.lang = next;
    };
    apply();
    window.addEventListener("pbzone-session-ready", apply);
    return () => window.removeEventListener("pbzone-session-ready", apply);
  }, []);

  const value = useMemo<I18n>(() => ({ lang, t: (key, vars) => translateHome(lang, key, vars) }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
