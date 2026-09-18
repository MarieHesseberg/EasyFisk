"use client";
import { ProfileForm } from "../profile-form";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";

import { FormError } from "@/components/ui/form-error";
import { useLanguage } from "@/components/localization/language-provider";
export function ProfilePrivacyDetail() {
  const { t } = useLanguage();
  const { error, preferences, setPositionSuggestions, setShareAnonymousData } =
    usePreferencesController();

  return (
    <div className="specific-detail">
      <ProfileForm />
      <h3 className="detail-subtitle">{t("copy.personvern.og.samtykker.274afdf")}</h3>
      <div className="toggle-list">
        <label>
          <span>
            <b>{t("copy.posisjon.ved.soneforslag.bafc7ae")}</b>
            <small>{t("copy.brukes.bare.nar.du.ber.om.a.finne.riktig.sone.7c5cebf")}</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.positionSuggestions}
            onChange={(event) => setPositionSuggestions(event.target.checked)}
          />
        </label>
        <label>
          <span>
            <b>{t("copy.del.anonymisert.innsatsdata.473258a")}</b>
            <small>{t("copy.bidrar.til.statistikk.uten.a.vise.identiteten.di.12ef03b")}</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.shareAnonymousData}
            onChange={(event) => setShareAnonymousData(event.target.checked)}
          />
        </label>
      </div>
      <FormError message={error ? t(error) : undefined} />
      <p role="status">{t("settings.autoSave")}</p>
    </div>
  );
}
