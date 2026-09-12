import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { RuleCenter } from "@/features/rules/rule-center";
import { useLanguage } from "@/components/localization/language-provider";
export function RulesScreen({
  demoStatus,
  onRegisterPermit,
}: {
  demoStatus: DemoStatus;
  onRegisterPermit: () => void;
}) {
  const { language, t } = useLanguage();
  const missing = demoStatus === "noPermit" || demoStatus === "allMissing";
  const { metadata, quota, reporting, season } = activeFishingRules;
  const { riverStatus } = appContentRepository.getContent();
  const personalZone =
    demoStatus === "wrongZone" ? riverStatus.alternatePermitZoneName : riverStatus.currentZoneName;
  return (
    <div className="screen rules-screen">
      <ScreenHeader
        title={t("copy.fiskeregler.647b384")}
        eyebrow={`${metadata.river.toUpperCase()} · ${selectLocalized(language, "REGELVERSJON", "RULE VERSION")} ${metadata.versionLabel.toUpperCase()}`}
      />
      <section className={"personal-rules " + (missing ? "missing" : "ready")}>
        <div className="personal-rules-title">
          <span>
            <Icon name={missing ? "ticket" : "book"} />
          </span>
          <div>
            <small>{t("copy.regler.for.meg.c93f97c")}</small>
            <h2>{t(missing ? "Registrer fiskekort" : "Tilpasset ditt fiskekort")}</h2>
          </div>
        </div>
        {missing ? (
          <>
            <p>{t("rules.missingPermit")}</p>
            <button onClick={onRegisterPermit}>{t("copy.registrer.fiskekort.8f222df")}</button>
          </>
        ) : (
          <>
            <p className="permit-zone">
              <Icon name="pin" size={17} />
              <b>{t(personalZone)}</b>
              <span>
                {selectLocalized(
                  language,
                  `Døgnkort · gyldig til ${riverStatus.permitExpiry}`,
                  `Day permit · valid until ${riverStatus.permitExpiry}`,
                )}
              </span>
            </p>
            <div className="personal-rule-list">
              <p>
                <b>{t("copy.sesong.a17a572")}</b>
                <span>
                  {selectLocalized(
                    language,
                    season.standardZoneLabel.replace("–", " til "),
                    season.standardZoneLabel.replace("juni", "June").replace("august", "August"),
                  )}
                </span>
              </p>
              <p>
                <b>{t("copy.kvote.6932153")}</b>
                <span>
                  {selectLocalized(
                    language,
                    `${quota.killedSalmonPerDay} avlivet laks per fiskerdøgn`,
                    `${quota.killedSalmonPerDay} harvested salmon per fishing day`,
                  )}
                </span>
              </p>
              <p>
                <b>{t("copy.rapportering.cbd0df4")}</b>
                <span>
                  {selectLocalized(
                    language,
                    `Så raskt som mulig og innen ${reporting.deadlineHours} timer`,
                    `As soon as possible and within ${reporting.deadlineHours} hours`,
                  )}
                </span>
              </p>
              <p>
                <b>{t("copy.redskap.48ea2b4")}</b>
                <span>{t("copy.flue.sluk.og.mark.etter.gjeldende.redskapsregler.ea78e8e")}</span>
              </p>
            </div>
            <small className="zone-note-text">{t("rules.permitBasedDisclaimer")}</small>
          </>
        )}
      </section>
      <div className="general-rules-heading">
        <small>{t("copy.gjelder.alle.fiskere.b103dd0")}</small>
        <h2>{t("copy.generelle.regler.d26a211")}</h2>
        <p>{t("copy.her.finner.du.hele.regelverket.ogsa.nar.personli.78e4a56")}</p>
      </div>
      <RuleCenter />
    </div>
  );
}
