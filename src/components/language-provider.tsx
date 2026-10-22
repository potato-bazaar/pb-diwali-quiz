"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, type MessageKey } from "@/i18n/messages";
import { fetchProfileLanguage } from "@/lib/diwali-quiz-api";
import { languageFromSession, normalizeLanguage, type AppLanguage } from "@/lib/language";

type I18n = {
  lang: AppLanguage;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18n>({
  lang: "en",
  t: (key, vars) => translate("en", key, vars),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<AppLanguage>("en");

  useEffect(() => {
    const apply = (next: AppLanguage) => {
      setLang(next);
      document.documentElement.lang = next;
    };
    apply(languageFromSession());

    const onReady = () => apply(languageFromSession());
    window.addEventListener("pbzone-session-ready", onReady);

    const params = new URLSearchParams(window.location.search);
    const explicit = normalizeLanguage(params.get("language") ?? params.get("lang"));
    if (explicit) {
      return () => window.removeEventListener("pbzone-session-ready", onReady);
    }

    let cancelled = false;
    void fetchProfileLanguage().then((code) => {
      const parsed = normalizeLanguage(code);
      if (!cancelled && parsed) apply(parsed);
    });
    return () => {
      cancelled = true;
      window.removeEventListener("pbzone-session-ready", onReady);
    };
  }, []);

  const value = useMemo<I18n>(
    () => ({ lang, t: (key, vars) => translate(lang, key, vars) }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
