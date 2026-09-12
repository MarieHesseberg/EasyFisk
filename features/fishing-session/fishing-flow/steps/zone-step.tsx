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
}: {
  back: () => void;
  demoStatus: DemoStatus;
  next: () => void;
  selectedZone: ZoneId;
  selectZone: (zone: ZoneId) => void;
  permittedZoneIds: readonly ZoneId[];
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
            : selectLocalized(language, `Vi fant ${zoneLabel}`, `We found ${zoneLabel}`)
        }
        text={
          nearBorder
            ? t("content.4f00e6e146c3")
            : selectLocalized(
                language,
                `Posisjonen din ser ut til å være i ${selectedZoneContent.name}.`,
                `Your location appears to be in ${t(selectedZoneContent.name)}.`,
              )
        }
      />
      {nearBorder && (
        <div className="scenario-banner warning">
          <b>{t("copy.gps.treffet.er.usikkert.9275f07")}</b>
          <span>{t("copy.ca.18.meter.fra.registrert.sonegrense.f484f23")}</span>
        </div>
      )}
      <div className="zone-confirm">
        <div className={"mini-map " + (nearBorder ? "border-hit" : "")}>
          <span>{nearBorder ? t("content.72168dde2f56") : t("content.3ba9211139e3")}</span>
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
            <select id="session-subzone">
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
      <button className="primary" onClick={next}>
        {t("copy.bekreft.sone.og.se.regler.495416b")}
      </button>
      <button className="text-button" onClick={back}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
