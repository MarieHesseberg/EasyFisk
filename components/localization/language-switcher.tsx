"use client";

import { useLanguage } from "./language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="language-switcher" role="group" aria-label="Velg språk" translate="no">
      <button type="button" aria-pressed={language === "no"} onClick={() => setLanguage("no")}>
        NO
      </button>
      <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>
        EN
      </button>
    </div>
  );
}
