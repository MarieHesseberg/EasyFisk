"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import { useLanguage } from "@/components/localization/language-provider";

const { headerAlerts } = appContentRepository.getContent();

export function ScreenHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const { t } = useLanguage();
  const [showAlerts, setShowAlerts] = useState(false);
  return (
    <header className="app-header">
      <div>
        <span className="brand-mark">
          <Icon name="fish" size={19} />
        </span>
        <span className="wordmark">easyfisk</span>
      </div>
      <div className="app-header-actions">
        <LanguageSwitcher />
        {!eyebrow && (
          <button
            className="round-btn"
            aria-label={t("copy.varsler.0c495cd")}
            onClick={() => setShowAlerts(true)}
          >
            <Icon name="bell" size={20} />
            <i />
          </button>
        )}
      </div>
      {eyebrow && <p>{eyebrow}</p>}
      <h1>{title}</h1>
      {showAlerts && (
        <div className="header-alert-panel">
          <button aria-label={t("copy.lukk.varsler.3e7a49b")} onClick={() => setShowAlerts(false)}>
            ×
          </button>
          <small>{t("copy.varsler.9c9660c")}</small>
          <h3>{t("copy.kontrollerte.meldinger.og.eksempelvarsler.3bed6fe")}</h3>
          {headerAlerts.map((alert) => (
            <p key={alert.message}>
              <Icon name={alert.icon} size={15} /> {t(alert.message)}
            </p>
          ))}
        </div>
      )}
    </header>
  );
}
