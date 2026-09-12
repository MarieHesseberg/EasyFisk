"use client";
import { selectLocalized } from "@/locales";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  translateContent,
  type AppLanguage,
  type TranslationKey,
  type TranslationVariables,
} from "@/locales";
export type { AppLanguage, TranslationKey } from "@/locales";
const storageKey = "easyfisk-language";
type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey | string, variables?: TranslationVariables) => string;
};
const LanguageContext = createContext<LanguageContextValue>({
  language: "no",
  setLanguage: () => undefined,
  t: (key, variables) => translateContent("no", key, variables),
});
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<AppLanguage>("no");
  const savedLanguage = useRef<AppLanguage | null>(null);
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    savedLanguage.current = saved === "en" ? "en" : "no";
    if (saved !== "en") return;
    const timeout = window.setTimeout(() => updateLanguage("en"), 0);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (savedLanguage.current === "en" && language === "no") return;
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = selectLocalized(language, "no", "en");
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      setLanguage(nextLanguage: AppLanguage) {
        savedLanguage.current = nextLanguage;
        updateLanguage(nextLanguage);
      },
      t(key: TranslationKey | string, variables?: TranslationVariables) {
        return translateContent(language, key, variables);
      },
    }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  return useContext(LanguageContext);
}
