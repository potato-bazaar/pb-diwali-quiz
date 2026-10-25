"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translateHome, type HomeMessageKey } from "@/i18n/home-messages";
import { fetchProfileLanguage } from "@/lib/diwali-quiz-api";
import { languageFromSession, languageFromToken, normalizeLanguage, type AppLanguage } from "@/lib/language";
import { getSession, rememberLanguage } from "@/lib/session";

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
    let cancelled = false;

    const apply = (next: AppLanguage) => {
      if (cancelled || !next) return;
      setLang(next);
      document.documentElement.lang = next;
    };

    const refresh = async () => {
      const session = getSession();
      apply(
        languageFromToken(session.token) ??
          languageFromSession() ??
          "en",
      );

      const fromApi = normalizeLanguage(await fetchProfileLanguage());
      if (fromApi) {
        rememberLanguage(fromApi);
        apply(fromApi);
      }
    };

    void refresh();
    const onReady = () => {
      void refresh();
    };
    window.addEventListener("pbzone-session-ready", onReady);
    const retry = window.setTimeout(() => {
      void refresh();
    }, 400);

    return () => {
      cancelled = true;
      window.removeEventListener("pbzone-session-ready", onReady);
      window.clearTimeout(retry);
    };
  }, []);

  const value = useMemo<I18n>(() => ({ lang, t: (key, vars) => translateHome(lang, key, vars) }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
