import { localizeZoneName } from "@/lib/localize-zone-name";
import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import {
  getDisplayedPermit,
  getPermitZoneId,
  isPermitValid,
} from "@/domain/documents/get-permit-zones";
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
  const permit = getDisplayedPermit(documents, now, selectedZone);
  const permitZone = permit ? getPermitZoneId(permit)! : undefined;
  const missing = !permit;
  const { quota, reporting } = activeFishingRules;
  const personalZone = permitZone
    ? (fishingContentRepository.findZone(permitZone)?.name ?? `Sone ${permitZone}`)
    : "";
  return (
    <div className="screen rules-screen">
      <ScreenHeader title={t("copy.fiskeregler.647b384")} />
      <section className={"personal-rules " + (missing ? "missing" : "ready")}>
        <div className="personal-rules-title">
          <span>
            <Icon name={missing ? "ticket" : "book"} />
          </span>
          <div>
            <small>{t("copy.regler.for.meg.c93f97c")}</small>
            <h2>
              {missing
                ? selectLocalized(
                    language,
                    "Spesifikke regler for din sone",
                    "Specific rules for your zone",
                  )
                : selectLocalized(
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
            <button onClick={onRegisterPermit}>{t("copy.registrer.fiskekort.8f222df")}</button>
          </>
        ) : (
          <>
            <p className="permit-zone">
              <Icon name="pin" size={17} />
              <b>{localizeZoneName(permit.values.area ?? personalZone, language)}</b>
              <span>
                {selectLocalized(
                  language,
                  `${permit.values.category ?? "Fiskekort"} · ${isPermitValid(permit, now) ? "gyldig til" : new Date(permit.values.startsAt ?? "").getTime() > now ? "gyldig fra" : "utløpt"} ${(new Date(permit.values.startsAt ?? "").getTime() > now ? permit.values.startsAt : permit.values.endsAt)?.replace("T", " ")}`,
                  `${t(permit.values.category ?? "Fiskekort")} · ${isPermitValid(permit, now) ? "valid until" : new Date(permit.values.startsAt ?? "").getTime() > now ? "valid from" : "expired"} ${(new Date(permit.values.startsAt ?? "").getTime() > now ? permit.values.startsAt : permit.values.endsAt)?.replace("T", " ")}`,
                )}
              </span>
            </p>
            <div className="personal-rule-list">
              <p>
                <b>{t("copy.sesong.a17a572")}</b>
                <span>{t(getZoneSeasonLabel(permitZone!))}</span>
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
      </div>
      <RuleCenter />
    </div>
  );
}
