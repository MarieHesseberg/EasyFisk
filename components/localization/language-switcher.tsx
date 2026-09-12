"use client";

import { useLanguage } from "./language-provider";
import { Icon } from "@/components/ui/icon";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const isNorwegian = language === "no";
  return (
    <button
      className="language-switcher"
      type="button"
      aria-label={t(isNorwegian ? "language.switchToEnglish" : "language.switchToNorwegian")}
      onClick={() => setLanguage(isNorwegian ? "en" : "no")}
      translate="no"
    >
      <Icon name="language" size={17} />
      <span>{t(isNorwegian ? "language.english" : "language.norwegian")}</span>
    </button>
  );
}
