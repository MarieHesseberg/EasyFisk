"use client";
import { selectLocalized } from "@/locales";
import { usePreferencesController } from "@/features/profile/hooks/use-preferences-controller";
import { appContentRepository } from "@/data/repositories/app-content";
import { FormError } from "@/components/ui/form-error";
import { useLanguage } from "@/components/localization/language-provider";
export function ProfilePrivacyDetail() {
  const { language, t } = useLanguage();
  const { error, preferences, setPositionSuggestions, setShareAnonymousData } =
    usePreferencesController();
  const { profile } = appContentRepository.getContent();
  return (
    <div className="specific-detail">
      <div className="profile-detail">
        <div className="avatar">{profile.initials}</div>
        <div>
          <h3>{t("copy.fiskerprofil.3593163")}</h3>
          <p>
            {t("copy.fisker.id.d632837")} {profile.fisherId}
          </p>
        </div>
      </div>
      <div className="detail-data">
        <p>
          <span>{t("copy.navn.32dae7e")}</span>
          <b>{t(profile.name)}</b>
        </p>
        <p>
          <span>{t("copy.telefon.40314f8")}</span>
          <b>{profile.maskedPhone}</b>
        </p>
        <p>
          <span>{t("copy.sprak.52ba694")}</span>
          <b>{selectLocalized(language, profile.language, "English")}</b>
        </p>
      </div>
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
