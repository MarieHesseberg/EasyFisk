"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";

export function ScreenHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const [showAlerts, setShowAlerts] = useState(false);
  return (
    <header className="app-header">
      <div>
        <span className="brand-mark">
          <Icon name="fish" size={19} />
        </span>
        <span className="wordmark">easyfisk</span>
      </div>
      {eyebrow ? (
        <p>{eyebrow}</p>
      ) : (
        <button className="round-btn" aria-label="Varsler" onClick={() => setShowAlerts(true)}>
          <Icon name="bell" size={20} />
          <i />
        </button>
      )}
      <h1>{title}</h1>
      {showAlerts && (
        <div className="header-alert-panel">
          <button aria-label="Lukk varsler" onClick={() => setShowAlerts(false)}>
            ×
          </button>
          <small>VARSLER</small>
          <h3>Ingen kritiske varsler</h3>
          <p>
            <Icon name="check" size={15} /> Elva og Sone 3 er åpne.
          </p>
          <p>
            <Icon name="clock" size={15} /> Fiskekortet utløper i dag kl. 17:59.
          </p>
          <p>
            <Icon name="bell" size={15} /> Reglene ble oppdatert{" "}
            {activeFishingRules.metadata.shortVersionLabel}.
          </p>
        </div>
      )}
    </header>
  );
}
