"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";

const { headerAlerts } = appContentRepository.getContent();

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
          <h3>Kontrollerte meldinger og eksempelvarsler</h3>
          {headerAlerts.map((alert) => (
            <p key={alert.message}>
              <Icon name={alert.icon} size={15} /> {alert.message}
            </p>
          ))}
        </div>
      )}
    </header>
  );
}
