import { localizeZoneName } from "@/lib/localize-zone-name";
import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { getPermitZoneId, isPermitValid } from "@/domain/documents/get-permit-zones";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import type { ZoneId } from "@/domain/zones/zone";
import { getZoneSeasonLabel } from "@/domain/zones/zone-rules";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { RuleCenter } from "@/features/rules/rule-center";
import { useLanguage } from "@/components/localization/language-provider";
export function RulesScreen({
  selectedZone = 3,
  documents = [],
  now,
  onRegisterPermit,
}: {
  demoStatus: DemoStatus;
  selectedZone?: ZoneId;
  documents?: FishingDocument[];
  now: number;
  onRegisterPermit: () => void;
}) {
  const { language, t } = useLanguage();
  const permit = documents.find(
    (document) => isPermitValid(document, now) && getPermitZoneId(document) === selectedZone,
  );
  const missing = !permit;
  const { metadata, quota, reporting } = activeFishingRules;
  const personalZone =
    fishingContentRepository.findZone(selectedZone)?.name ?? `Sone ${selectedZone}`;
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
            <h2>
              {selectLocalized(
                language,
                `Regler for ${personalZone}`,
                `Rules for ${localizeZoneName(personalZone, language)}`,
              )}
            </h2>
          </div>
        </div>
        {missing ? (
          <>
            <p>{t("rules.missingPermit")}</p>
            <p>{t(getZoneSeasonLabel(selectedZone))}</p>
            <button onClick={onRegisterPermit}>{t("copy.registrer.fiskekort.8f222df")}</button>
          </>
        ) : (
          <>
            <p className="permit-zone">
              <Icon name="pin" size={17} />
              <b>{localizeZoneName(personalZone, language)}</b>
              <span>
                {selectLocalized(
                  language,
                  `${permit.values.category ?? "Fiskekort"} · gyldig til ${permit.values.endsAt?.replace("T", " ")}`,
                  `${t(permit.values.category ?? "Fiskekort")} · valid until ${permit.values.endsAt?.replace("T", " ")}`,
                )}
              </span>
            </p>
            <div className="personal-rule-list">
              <p>
                <b>{t("copy.sesong.a17a572")}</b>
                <span>{t(getZoneSeasonLabel(selectedZone))}</span>
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
