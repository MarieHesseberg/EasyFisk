import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import { getPrototypePermitProductDetails } from "@/data/prototype/mandalselva-permit-product-details";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { isPermitValid } from "@/domain/documents/get-permit-zones";
import { getPersonalPermitContext } from "@/domain/fishing-rules/get-personal-permit-context";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { getAppDate } from "@/domain/shared/app-clock";
import { localizeZoneName } from "@/lib/localize-zone-name";
import { selectLocalized } from "@/locales";

export function PersonalPermitRules({ permit, now }: { permit: FishingDocument; now: number }) {
  const { language, t } = useLanguage();
  const context = getPersonalPermitContext(permit, permitCatalogRepository.listProducts());
  if (!context) return null;
  const details = context.product ? getPrototypePermitProductDetails(context.product) : undefined;
  const localRules = details?.localRules ?? [];
  const { quota, reporting } = activeFishingRules;
  const future = new Date(permit.values.startsAt ?? "").getTime() > now;
  const valid = isPermitValid(permit, now);
  const label = valid
    ? selectLocalized(language, "Gyldig til", "Valid until")
    : future
      ? selectLocalized(language, "Gyldig fra", "Valid from")
      : selectLocalized(language, "Utløpt", "Expired");
  const date = (future ? permit.values.startsAt : permit.values.endsAt) ?? "";
  const [day, time] = date.split("T");
  const formattedDate = day.split("-").reverse().join(".");
  return (
    <>
      <p className="permit-zone">
        <Icon name="pin" size={20} />
        <b>{localizeZoneName(permit.values.area ?? context.areaName, language)}</b>
        <span>
          {t(permit.values.category ?? "Fiskekort")} ·{" "}
          {label.toLocaleLowerCase(language === "no" ? "nb" : "en")} {formattedDate} {time}
        </span>
      </p>
      {getAppDate(now) > context.seasonEnd && (
        <div className="season-alert" role="alert">
          <Icon name="bell" size={20} />
          <b>
            {selectLocalized(
              language,
              "Fiskesesongen er avsluttet i dette området.",
              "The fishing season has ended in this area.",
            )}
          </b>
        </div>
      )}
      <div className="personal-rule-list">
        <p>
          <b>{t("copy.sesong.a17a572")}</b>
          <span>{t(context.seasonLabel)}</span>
        </p>
        <p>
          <b>{t("copy.kvote.6932153")}</b>
          <span>
            {selectLocalized(
              language,
              `Per fiskerdøgn: ${quota.killedSalmonPerDay} avlivet og ${quota.releasedSalmonPerDay} gjenutsatte laks.`,
              `Per fishing day: ${quota.killedSalmonPerDay} harvested and ${quota.releasedSalmonPerDay} released salmon.`,
            )}
          </span>
        </p>
        <p>
          <b>{t("copy.rapportering.cbd0df4")}</b>
          <span>
            {selectLocalized(
              language,
              `Rapporter fangst så raskt som mulig og innen ${reporting.deadlineHours} timer. Registrer også turer uten fangst.`,
              `Report catches as soon as possible and within ${reporting.deadlineHours} hours. Also record trips without a catch.`,
            )}
          </span>
        </p>
      </div>
      {localRules.length > 0 && (
        <div className="personal-local-rules">
          <b>{selectLocalized(language, "Husk i dette området", "Remember in this area")}</b>
          {localRules.map((rule) => (
            <p key={rule}>{t(rule)}</p>
          ))}
        </div>
      )}
      {context.product?.type === "season" && details && (
        <p className="personal-reporting-rule">{t(details.reportingRule)}</p>
      )}
      <details className="rules-disclosure personal-rule-details">
        <summary>
          {selectLocalized(
            language,
            "Flere regler og områdeinformasjon",
            "More rules and area information",
          )}
        </summary>
        <div className="personal-rule-list">
          <p>
            <b>{selectLocalized(language, "Sesongkvote", "Season quota")}</b>
            <span>
              {selectLocalized(
                language,
                `${quota.killedSalmonPerSeason} avlivede og ${quota.releasedSalmonPerSeason} gjenutsatte laks. Størrelsesreglene gjelder i tillegg.`,
                `${quota.killedSalmonPerSeason} harvested and ${quota.releasedSalmonPerSeason} released salmon. Size restrictions also apply.`,
              )}
            </span>
          </p>
          <p>
            <b>{t("copy.redskap.48ea2b4")}</b>
            <span>{t("copy.flue.sluk.og.mark.etter.gjeldende.redskapsregler.ea78e8e")}</span>
          </p>
        </div>
        {details?.equipmentAndFacilities
          .filter((text) => !localRules.includes(text))
          .map((text) => (
            <p key={text}>{t(text)}</p>
          ))}
        <p>{t("rules.permitBasedDisclaimer")}</p>
        {context.product && (
          <a href={context.product.source.url} target="_blank" rel="noreferrer">
            {selectLocalized(language, "Se vilkårene for ditt fiskekort", "View your permit terms")}{" "}
            ↗
          </a>
        )}
      </details>
    </>
  );
}
