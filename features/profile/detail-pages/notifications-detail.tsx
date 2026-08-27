"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { NotificationPreference } from "@/domain/preferences/preferences";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";

const notifications: Array<[NotificationPreference, string, string]> = [
  ["emergencyClosure", "Akutt stengning", "Varsle dersom hele elva eller min sone stenges"],
  [
    "highTemperature",
    "Høy vanntemperatur",
    `Varsle når temperaturen nærmer seg ${activeFishingRules.temperature.closureThresholdCelsius} °C`,
  ],
  ["ruleChanges", "Regelendringer", "Varsle når kvoter eller fisketider endres"],
  [
    "reportingDeadline",
    "Rapporteringsfrist",
    "Påminnelse hvis en fangst ikke er ferdig rapportert",
  ],
];

export function NotificationsDetail() {
  const [saved, setSaved] = useState(false);
  const { preferences, setNotification } = usePreferencesController();
  return (
    <div className="specific-detail">
      <div className="detail-alert">
        <Icon name="check" />
        <div>
          <small>STATUS NÅ</small>
          <h3>Elva er åpen</h3>
          <p>11 °C ved Kjølemo · ingen aktive stengninger</p>
        </div>
      </div>
      <h3 className="detail-subtitle">Mine varsler</h3>
      <div className="toggle-list">
        {notifications.map(([id, label, description]) => (
          <label key={id}>
            <span>
              <b>{label}</b>
              <small>{description}</small>
            </span>
            <input
              type="checkbox"
              checked={preferences.notifications[id]}
              onChange={(event) => setNotification(id, event.target.checked)}
            />
          </label>
        ))}
      </div>
      <button className="primary" onClick={() => setSaved(true)}>
        {saved ? "Varselinnstillinger lagret" : "Lagre varselinnstillinger"}
      </button>
    </div>
  );
}
