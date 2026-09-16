import { selectLocalized } from "@/locales";
import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import type { ZoneId } from "@/domain/zones/zone";
import { getSubzones } from "@/domain/zones/zone-rules";
import { useLanguage } from "@/components/localization/language-provider";
const zones = fishingContentRepository.getZones();
export function ZoneStep({
  back,
  demoStatus,
  next,
  selectedZone,
  selectZone,
  permittedZoneIds,
  subzone = "",
  selectSubzone,
  located = false,
}: {
  back: () => void;
  demoStatus: DemoStatus;
  next: () => void;
  selectedZone: ZoneId;
  selectZone: (zone: ZoneId) => void;
  permittedZoneIds: readonly ZoneId[];
  subzone?: string;
  selectSubzone?: (value: string) => void;
  located?: boolean;
}) {
  const { language, t } = useLanguage();
  const nearBorder = demoStatus === "zoneBorder";
  const selectedZoneContent = zones.find((zone) => zone.id === selectedZone) ?? zones[0];
  const selectedSubzones = getSubzones(selectedZone);
  const zoneLabel = t(selectedZoneContent.name.split(" · ")[0]);
  return (
    <>
      <FlowTitle
        icon="map"
        eyebrow="SONEFORSLAG"
        title={
          nearBorder
            ? t("content.5fbd077790ed")
            : selectLocalized(
                language,
                `${located ? "Posisjonsforslag:" : "Valgt sone:"} ${zoneLabel}`,
                `${located ? "Location suggestion:" : "Selected zone:"} ${zoneLabel}`,
              )
        }
        text={
          nearBorder
            ? selectLocalized(
                language,
                "Testscenario: kontroller valgt sone mot fysisk oppmerking.",
                "Test scenario: check the selected zone against physical signs.",
              )
            : selectLocalized(
                language,
                `Bekreft at du skal fiske i ${selectedZoneContent.name}.`,
                `Confirm that you will fish in ${t(selectedZoneContent.name)}.`,
              )
        }
      />
      {nearBorder && (
        <div className="scenario-banner warning">
          <b>
            {selectLocalized(
              language,
              "Testscenario: usikker sonegrense",
              "Test scenario: uncertain zone boundary",
            )}
          </b>
          <span>
            {selectLocalized(
              language,
              "Kontroller sonen mot fysisk oppmerking.",
              "Check the zone against physical signs.",
            )}
          </span>
        </div>
      )}
      <div className="zone-confirm">
        <div className={"mini-map " + (nearBorder ? "border-hit" : "")}>
          <span>
            {nearBorder
              ? t("content.72168dde2f56")
              : selectLocalized(language, "VALGT SONE", "SELECTED ZONE")}
          </span>
          <i />
        </div>
        <label htmlFor="session-zone">{t("copy.hovedsone.449c2c3")}</label>
        <select
          id="session-zone"
          value={selectedZone}
          onChange={(event) => selectZone(Number(event.target.value) as ZoneId)}
        >
          {zones.map((zone) => (
            <option
              key={zone.id}
              value={zone.id}
              disabled={permittedZoneIds.length > 0 && !permittedZoneIds.includes(zone.id)}
            >
              {t(zone.name)}
            </option>
          ))}
        </select>
        {selectedSubzones.length > 0 && (
          <>
            <label htmlFor="session-subzone">{t("copy.delsone.ec5e5cb")}</label>
            <select
              id="session-subzone"
              value={subzone}
              onChange={(event) => selectSubzone?.(event.target.value)}
            >
              <option value="">
                {selectLocalized(language, "Velg delsone", "Select subzone")}
              </option>
              {selectedSubzones.map((subzone) => (
                <option key={subzone}>{subzone}</option>
              ))}
            </select>
          </>
        )}
      </div>
      <p className="auto-note">
        <Icon name="book" size={17} />
        {permittedZoneIds.length > 0
          ? selectLocalized(
              language,
              `Fiskekortet ditt gjelder ${permittedZoneIds.map((zoneId) => t("common.zone", { number: zoneId })).join(" og ")}. Andre soner kan ikke velges for denne økten.`,
              `Your fishing permit is valid for ${permittedZoneIds.map((zoneId) => t("common.zone", { number: zoneId })).join(" and ")}. Other zones cannot be selected for this session.`,
            )
          : t("content.8af2db4cecac")}
      </p>
      <button
        className="primary"
        disabled={
          (selectedSubzones.length > 0 && !subzone) ||
          (permittedZoneIds.length > 0 && !permittedZoneIds.includes(selectedZone))
        }
        onClick={next}
      >
        {t("copy.bekreft.sone.og.se.regler.495416b")}
      </button>
      <button className="text-button" onClick={back}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
