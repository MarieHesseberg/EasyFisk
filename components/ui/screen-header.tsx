"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useHeaderNotices } from "@/features/notifications/use-header-notices";
import { selectLocalized } from "@/locales";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import { useLanguage } from "@/components/localization/language-provider";

export function ScreenHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const { language, t } = useLanguage();
  const { notices, unread, markRead } = useHeaderNotices();
  const [readError, setReadError] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  return (
    <header className="app-header">
      <div>
        <button
          className="brand-home"
          aria-label={t("copy.tilbake.til.hjem.d935a7f")}
          onClick={() => window.dispatchEvent(new Event("easyfisk-home"))}
        >
          <span className="brand-mark">
            <Icon name="fish" size={19} />
          </span>
          <span className="wordmark">easyfisk</span>
        </button>
      </div>
      <div className="app-header-actions">
        <LanguageSwitcher />
        {!eyebrow && (
          <button
            className="round-btn"
            aria-label={t("copy.varsler.0c495cd")}
            aria-expanded={showAlerts}
            aria-controls="header-notices"
            onClick={() => {
              setShowAlerts(!showAlerts);
              if (!showAlerts) setReadError(!markRead());
            }}
          >
            <Icon name="bell" size={20} />
            {unread && (
              <i aria-label={selectLocalized(language, "Uleste varsler", "Unread notifications")} />
            )}
          </button>
        )}
      </div>
      {eyebrow && <p>{eyebrow}</p>}
      <h1>{title}</h1>
      {showAlerts && (
        <section
          className="header-alert-panel"
          id="header-notices"
          aria-label={t("copy.varsler.0c495cd")}
        >
          <button aria-label={t("copy.lukk.varsler.3e7a49b")} onClick={() => setShowAlerts(false)}>
            ×
          </button>
          <h3>{t("copy.varsler.0c495cd")}</h3>
          {notices.map((notice) => (
            <article key={notice.id}>
              <h4>{notice.title}</h4>
              <p>{notice.detail}</p>
            </article>
          ))}
          {readError && (
            <p role="alert">
              {selectLocalized(
                language,
                "Kunne ikke huske at varslene er lest. Prøv igjen.",
                "Could not save read status. Please try again.",
              )}
            </p>
          )}
        </section>
      )}
    </header>
  );
}
