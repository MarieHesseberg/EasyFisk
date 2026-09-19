import { RulesStep } from "./rules-step";
import { hasAcceptedCurrentRules } from "@/application/rules/rule-acceptance";
import { useState } from "react";
import { selectLocalized } from "@/locales";
import { useLanguage } from "@/components/localization/language-provider";
import { FlowTitle } from "@/components/ui/flow-title";
import { useUserLocation } from "@/features/map/hooks/use-user-location";
import { findMandalselvaZoneAtPosition } from "@/data/map/mandalselva-zone-boundaries";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { getSubzones } from "@/domain/zones/zone-rules";
import { localizeZoneName } from "@/lib/localize-zone-name";
import { localizeText } from "@/domain/localization/localized-text";
import type { ZoneId } from "@/domain/zones/zone";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";

const documentStatuses: DemoStatus[] = [
  "allMissing",
  "noPermit",
  "wrongZone",
  "expiredDisinfection",
  "otherRiver",
  "noFee",
];

export function StartSessionStep({
  initialZone,
  permittedZoneIds,
  demoStatus,
  scenario,
  documentReadiness,
  quotaStatus,
  resolveBlock,
  openPermitShop,
  finish,
}: {
  initialZone: ZoneId;
  permittedZoneIds: readonly ZoneId[];
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  quotaStatus: FishingStartQuotaStatus;
  resolveBlock: () => void;
  openPermitShop: () => void;
  finish: (zone: ZoneId, subzone?: string) => void;
}) {
  const { language, t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<ZoneId>(initialZone);
  const [subzone, setSubzone] = useState("");
  const [selection, setSelection] = useState<"none" | "manual" | "located">("none");
  const [hasChosen, setHasChosen] = useState(false);
  const [notice, setNotice] = useState("");
  const [showRules, setShowRules] = useState(false);
  const zones = fishingContentRepository.getZones();
  const outsideMessage = selectLocalized(
    language,
    "Posisjonen er utenfor de registrerte fiskesonene. Velg sone manuelt.",
    "Your location is outside the registered fishing zones. Choose a zone manually.",
  );
  function acceptPosition(zone?: ZoneId) {
    setSubzone("");
    setHasChosen(zone !== undefined);
    setSelection(zone === undefined ? "manual" : "located");
    setNotice(zone === undefined ? outsideMessage : "");
    if (zone !== undefined) setSelectedZone(zone);
  }
  const location = useUserLocation((position) => {
    acceptPosition(findMandalselvaZoneAtPosition(position));
    return "";
  });
  const locationFailed = ["permission-denied", "unavailable", "timeout", "insecure"].includes(
    location.state,
  );
  const showSelection = selection !== "none" || locationFailed;
  const permitMissing = permittedZoneIds.length === 0;
  const documentsBlocked =
    permitMissing || !documentReadiness.valid.disinfection || !documentReadiness.valid.fee;
  const restrictionBlocked =
    quotaStatus.dailyReached ||
    (scenario.level === "blocked" && !documentStatuses.includes(demoStatus));
  const zoneMismatch = hasChosen && !permitMissing && !permittedZoneIds.includes(selectedZone);
  const blocked = documentsBlocked || restrictionBlocked;
  const subzones = getSubzones(selectedZone);
  const canStart =
    hasChosen &&
    !blocked &&
    !zoneMismatch &&
    (!subzones.length || !!subzone) &&
    !location.isLoading;
  const zoneLabel = t("common.zone", { number: selectedZone });
  function requestLocation() {
    location.cancel();
    setHasChosen(false);
    setSelection("none");
    setNotice("");
    location.locate();
  }
  if (showRules)
    return (
      <RulesStep
        selectedZone={selectedZone}
        back={() => setShowRules(false)}
        finish={() => {
          if (canStart) finish(selectedZone, subzone || undefined);
        }}
      />
    );
  return (
    <>
      <FlowTitle
        icon="pin"
        eyebrow={selectLocalized(language, "FISKESTED", "FISHING LOCATION")}
        title={t("copy.finn.riktig.fiskesone.33661af")}
        text={t("location.singleUse")}
      />
      <button
        className={showSelection ? "secondary" : "primary"}
        disabled={location.isLoading}
        onClick={requestLocation}
      >
        {t("copy.tillat.og.finn.sone.3fbbe01")}
      </button>
      {location.isLoading && <p role="status">{location.message}</p>}
      {(notice || locationFailed) && (
        <p className="start-location-warning" role="alert">
          {notice || location.message}
        </p>
      )}
      {!showSelection && (
        <button
          className="text-button"
          onClick={() => {
            location.cancel();
            setSelection("manual");
            setHasChosen(true);
            setNotice("");
          }}
        >
          {t("copy.velg.sone.manuelt.ad41072")}
        </button>
      )}
      {showSelection && (
        <div className="start-zone-fields">
          {selection === "located" && (
            <p role="status">
              <b>
                {selectLocalized(
                  language,
                  `Posisjonsforslag: ${zoneLabel}`,
                  `Location suggestion: ${zoneLabel}`,
                )}
              </b>
            </p>
          )}
          <label htmlFor="start-zone">{t("copy.hovedsone.449c2c3")}</label>
          <select
            id="start-zone"
            value={hasChosen ? selectedZone : ""}
            onChange={(event) => {
              location.cancel();
              setSelectedZone(Number(event.target.value) as ZoneId);
              setHasChosen(true);
              setSubzone("");
              setSelection("manual");
              setNotice("");
            }}
          >
            <option value="" disabled>
              {selectLocalized(language, "Velg hovedsone", "Select main zone")}
            </option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {localizeZoneName(zone.name, language)}
              </option>
            ))}
          </select>
          {hasChosen && subzones.length > 0 && (
            <>
              <label htmlFor="start-subzone">{t("copy.delsone.ec5e5cb")}</label>
              <select
                id="start-subzone"
                value={subzone}
                onChange={(event) => setSubzone(event.target.value)}
              >
                <option value="">
                  {selectLocalized(language, "Velg delsone", "Select subzone")}
                </option>
                {subzones.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </>
          )}
          {zoneMismatch && (
            <p className="start-location-warning" role="alert">
              {selectLocalized(
                language,
                `Fiskekortet ditt gjelder ikke ${zoneLabel}. Velg en sone kortet gjelder for, eller kjøp fiskekort.`,
                `Your permit is not valid for ${zoneLabel}. Choose a zone covered by your permit, or buy a fishing permit.`,
              )}
            </p>
          )}
        </div>
      )}
      {blocked && (
        <div className="start-location-warning" role="alert">
          <b>
            {restrictionBlocked
              ? t(localizeText(scenario.title, language))
              : t("content.74969123e7e8")}
          </b>
          <p>
            {restrictionBlocked
              ? t(localizeText(scenario.detail, language))
              : selectLocalized(
                  language,
                  "Registrer gyldig dokumentasjon før du starter turen.",
                  "Register valid documentation before starting your trip.",
                )}
          </p>
          <button className="secondary" onClick={permitMissing ? openPermitShop : resolveBlock}>
            {permitMissing
              ? t("content.b48667b3e672")
              : selectLocalized(language, "Se hva som mangler", "View what needs attention")}
          </button>
        </div>
      )}
      {showSelection && (
        <button
          className="primary start-trip-action"
          disabled={!canStart}
          onClick={() => {
            if (canStart) {
              if (hasAcceptedCurrentRules()) finish(selectedZone, subzone || undefined);
              else setShowRules(true);
            }
          }}
        >
          {hasChosen
            ? selectLocalized(
                language,
                `Start fiske i ${zoneLabel}`,
                `Start fishing in ${zoneLabel}`,
              )
            : selectLocalized(language, "Start fiske", "Start fishing")}
        </button>
      )}
    </>
  );
}
