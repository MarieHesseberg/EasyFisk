"use client";

import { useLanguage } from "./language-provider";
import { Icon } from "@/components/ui/icon";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      className="language-switcher"
      type="button"
      aria-label={language === "no" ? "Switch to English" : "Bytt til norsk"}
      onClick={() => setLanguage(language === "no" ? "en" : "no")}
      translate="no"
    >
      <Icon name="language" size={17} />
      <span>{language === "no" ? "English" : "Norsk"}</span>
    </button>
  );
}
