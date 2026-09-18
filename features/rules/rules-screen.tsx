import { localizeZoneName } from "@/lib/localize-zone-name";
import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { getDisplayedPermit, getPermitZoneId } from "@/domain/documents/get-permit-zones";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import type { ZoneId } from "@/domain/zones/zone";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { PersonalPermitRules } from "./personal-permit-rules";
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
          <PersonalPermitRules permit={permit} now={now} />
        )}
      </section>
      <div className="general-rules-heading">
        <small>{t("copy.gjelder.alle.fiskere.b103dd0")}</small>
        <h2>{t("copy.generelle.regler.d26a211")}</h2>
      </div>
      <RuleCenter now={now} />
    </div>
  );
}
