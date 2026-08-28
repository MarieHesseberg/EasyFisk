"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import { appContentRepository } from "@/data/repositories/app-content";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";

export function NotificationsDetail() {
  const [saved, setSaved] = useState(false);
  const { error, preferences, setNotification } = usePreferencesController();
  const { notificationOptions, notificationStatus } = appContentRepository.getContent().profile;
  return (
    <div className="specific-detail">
      <div className="detail-alert">
        <Icon name="check" />
        <div>
          <small>STATUS NÅ</small>
          <h3>Elva er åpen</h3>
          <p>{notificationStatus}</p>
        </div>
      </div>
      <h3 className="detail-subtitle">Mine varsler</h3>
      <div className="toggle-list">
        {notificationOptions.map(({ id, label, description }) => (
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
      <FormError message={error} />
      <button className="primary" disabled={Boolean(error)} onClick={() => setSaved(true)}>
        {saved ? "Varselinnstillinger lagret" : "Lagre varselinnstillinger"}
      </button>
    </div>
  );
}
