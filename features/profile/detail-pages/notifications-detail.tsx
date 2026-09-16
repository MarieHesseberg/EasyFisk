"use client";

import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import { appContentRepository } from "@/data/repositories/app-content";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";
import { useLanguage } from "@/components/localization/language-provider";

export function NotificationsDetail() {
  const { t } = useLanguage();
  const { error, preferences, setNotification } = usePreferencesController();
  const { notificationOptions, notificationStatus } = appContentRepository.getContent().profile;
  return (
    <div className="specific-detail">
      <div className="detail-alert">
        <Icon name="bell" />
        <div>
          <h3>{t("copy.kontroller.dagsaktuell.status.34a88f1")}</h3>
          <p>{t(notificationStatus)}</p>
        </div>
      </div>
      <h3 className="detail-subtitle">{t("copy.mine.varsler.1f8c375")}</h3>
      <div className="toggle-list">
        {notificationOptions.map(({ id, label, description }) => (
          <label key={id}>
            <span>
              <b>{t(label)}</b>
              <small>{t(description)}</small>
            </span>
            <input
              type="checkbox"
              checked={preferences.notifications[id]}
              onChange={(event) => setNotification(id, event.target.checked)}
            />
          </label>
        ))}
      </div>
      <FormError message={error ? t(error) : undefined} />
      <p role="status">{t("settings.autoSave")}</p>
    </div>
  );
}
