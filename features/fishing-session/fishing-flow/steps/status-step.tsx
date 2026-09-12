"use client";
import { selectLocalized } from "@/locales";
import { CheckRow } from "@/components/ui/check-row";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { FlowTitle } from "@/components/ui/flow-title";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { getZoneSeasonLabel } from "@/domain/zones/zone-rules";
import type { ZoneId } from "@/domain/zones/zone";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";
import { useLanguage } from "@/components/localization/language-provider";
import { localizeText } from "@/domain/localization/localized-text";
export function StatusStep({
  cancel,
  demoStatus,
  documentReadiness,
  isStatusTestMode,
  quotaStatus,
  next,
  resolveBlock,
  openPermitShop,
  scenario,
  selectedZone,
}: {
  cancel: () => void;
  demoStatus: DemoStatus;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  quotaStatus: FishingStartQuotaStatus;
  next: () => void;
  resolveBlock: () => void;
  openPermitShop: () => void;
  scenario: DemoScenario;
  selectedZone: ZoneId;
}) {
  const { language, t } = useLanguage();
  const { temperature } = activeFishingRules;
  const rawZoneName =
    fishingContentRepository.findZone(selectedZone)?.name ?? `Sone ${selectedZone}`;
  const zoneName = t(rawZoneName);
  const documentsBlocked = !documentReadiness.complete;
  const blocked = scenario.level === "blocked" || documentsBlocked;
  const title =
    scenario.level === "blocked"
      ? t(localizeText(scenario.title, language))
      : documentsBlocked
        ? t("content.74969123e7e8")
        : t(localizeText(scenario.title, language));
  const text =
    scenario.level === "blocked"
      ? t(localizeText(scenario.detail, language))
      : documentsBlocked
        ? selectLocalized(
            language,
            `${isStatusTestMode ? "Testmodus har satt" : "Registrert dokumentasjon viser"} ${documentReadiness.missingLabels.join(", ")} som manglende.`,
            `${isStatusTestMode ? "Test mode marks" : "Registered documents show"} ${documentReadiness.missingLabels.map((label) => t(label)).join(", ")} as missing.`,
          )
        : selectLocalized(
            language,
            `${t(localizeText(scenario.detail, language))} Egenregistrerte dokumenter må fortsatt kunne fremvises i original.`,
            `${t(localizeText(scenario.detail, language))} You must still be able to present the original documents.`,
          );
  const effectiveLevel = blocked ? "blocked" : scenario.level === "ok" ? "warning" : scenario.level;
  const permitBlocked =
    !documentReadiness.valid.permit || ["noPermit", "wrongZone"].includes(demoStatus);
  return (
    <>
      <FlowTitle
        icon="shield"
        eyebrow={isStatusTestMode ? t("content.6efd89ec2472") : t("content.83f5954f5c70")}
        title={title}
        text={text}
      />
      <div className={"scenario-banner " + effectiveLevel}>
        <b>
          {blocked
            ? t("content.e253e94863ca")
            : effectiveLevel === "warning"
              ? t("content.f9c3f7ac04c4")
              : t("content.882f7e25202d")}
        </b>
        <span>{documentsBlocked ? t("content.e8307858dceb") : t("content.9773621881bc")}</span>
      </div>
      <div className="flow-checks">
        <CheckRow
          title={`${selectLocalized(language, "Fiskekort", "Fishing permit")} · ${zoneName}`}
          sub={
            documentReadiness.valid.permit ? t("content.5415f8928832") : t("content.d4b76c3ed701")
          }
          state={
            documentReadiness.valid.permit && !["noPermit", "wrongZone"].includes(demoStatus)
              ? "ok"
              : "error"
          }
        />
        <CheckRow
          title={t("copy.statlig.fiskeravgift.ed960f5")}
          sub={documentReadiness.valid.fee ? t("content.3a3c8a487bfe") : t("content.d2f9bbdc940a")}
          state={documentReadiness.valid.fee && demoStatus !== "noFee" ? "ok" : "error"}
        />
        <CheckRow
          title={t("copy.desinfisering.1b73c82")}
          sub={
            documentReadiness.valid.disinfection
              ? t("content.e8de8be937b7")
              : t("content.c66f0c91b285")
          }
          state={
            documentReadiness.valid.disinfection &&
            !["expiredDisinfection", "otherRiver"].includes(demoStatus)
              ? "ok"
              : "error"
          }
        />
        <CheckRow
          title={t("copy.kvoter.og.rapportering.6b4b100")}
          sub={
            demoStatus === "dailyQuota"
              ? selectLocalized(
                  language,
                  `Døgnkvote nådd · ${quotaStatus.killedToday} avlivet · ${quotaStatus.releasedToday} gjenutsatt`,
                  `Daily quota reached · ${quotaStatus.killedToday} harvested · ${quotaStatus.releasedToday} released`,
                )
              : demoStatus === "seasonQuota"
                ? selectLocalized(
                    language,
                    `Sesongkvote nådd · ${quotaStatus.killedThisSeason} avlivet · ${quotaStatus.releasedThisSeason} gjenutsatt`,
                    `Season quota reached · ${quotaStatus.killedThisSeason} harvested · ${quotaStatus.releasedThisSeason} released`,
                  )
                : demoStatus === "lateReport"
                  ? t("copy.forsinket.fangstrapport.e554f1f")
                  : t("content.20dd57e881b6")
          }
          state={
            demoStatus === "seasonQuota"
              ? "warning"
              : ["dailyQuota", "lateReport"].includes(demoStatus)
                ? "error"
                : "ok"
          }
        />
        <CheckRow
          title={t("copy.temperatur.og.stengning.fce78e3")}
          sub={
            demoStatus === "hotWater"
              ? `${String(temperature.demoMeasuredCelsius).replace(".", selectLocalized(language, ",", "."))} °C · ${selectLocalized(language, "fisket er stanset", "fishing is suspended")}`
              : demoStatus === "closed"
                ? t("content.60956fa61772")
                : t("content.2828b2266a11")
          }
          state={["hotWater", "closed"].includes(demoStatus) ? "error" : "ok"}
        />
        <CheckRow
          title={t("copy.fiskesesong.2125fdb")}
          sub={`${zoneName} · ${t(getZoneSeasonLabel(selectedZone))}`}
        />
      </div>
      {blocked ? (
        <>
          <button
            className="primary blocked-action"
            onClick={
              permitBlocked ? openPermitShop : scenario.level === "blocked" ? resolveBlock : cancel
            }
          >
            {permitBlocked
              ? t("content.b48667b3e672")
              : scenario.action
                ? localizeText(scenario.action, language)
                : t("copy.lukk.og.registrer.dokumentasjon.aa7c204")}
          </button>
          <button className="secondary" onClick={cancel}>
            {t("copy.avbryt.oppstart.ec16466")}
          </button>
        </>
      ) : (
        <button className="primary" onClick={next}>
          {t("copy.jeg.har.kontrollert.originalene.fortsett.0517e88")}
        </button>
      )}
    </>
  );
}
