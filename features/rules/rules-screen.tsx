import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { RuleCenter } from "@/features/rules/rule-center";

export function RulesScreen({
  demoStatus,
  onRegisterPermit,
}: {
  demoStatus: DemoStatus;
  onRegisterPermit: () => void;
}) {
  const missing = demoStatus === "noPermit";
  const { metadata, quota, reporting, season } = activeFishingRules;
  const { riverStatus } = appContentRepository.getContent();
  const personalZone =
    demoStatus === "wrongZone" ? riverStatus.alternatePermitZoneName : riverStatus.currentZoneName;
  return (
    <div className="screen rules-screen">
      <ScreenHeader
        title="Fiskeregler"
        eyebrow={`${metadata.river.toUpperCase()} · REGELVERSJON ${metadata.versionLabel.toUpperCase()}`}
      />
      <section className={"personal-rules " + (missing ? "missing" : "ready")}>
        <div className="personal-rules-title">
          <span>
            <Icon name={missing ? "ticket" : "book"} />
          </span>
          <div>
            <small>REGLER FOR MEG</small>
            <h2>{missing ? "Registrer fiskekort" : "Tilpasset ditt fiskekort"}</h2>
          </div>
        </div>
        {missing ? (
          <>
            <p>
              Vi mangler fiskekortet ditt. Registrer kortet for å se regler for riktig hovedsone og
              eventuell delsone.
            </p>
            <button onClick={onRegisterPermit}>Registrer fiskekort</button>
          </>
        ) : (
          <>
            <p className="permit-zone">
              <Icon name="pin" size={17} />
              <b>{personalZone}</b>
              <span>Døgnkort · gyldig til {riverStatus.permitExpiry}</span>
            </p>
            <div className="personal-rule-list">
              <p>
                <b>Sesong</b>
                <span>{season.standardZoneLabel.replace("–", " til ")}</span>
              </p>
              <p>
                <b>Kvote</b>
                <span>{quota.killedSalmonPerDay} avlivet laks per fiskerdøgn</span>
              </p>
              <p>
                <b>Rapportering</b>
                <span>Så raskt som mulig og innen {reporting.deadlineHours} timer</span>
              </p>
              <p>
                <b>Redskap</b>
                <span>Flue, sluk og mark etter gjeldende redskapsregler</span>
              </p>
            </div>
            <small className="zone-note-text">
              Reglene er valgt ut fra fiskekortet. Kontroller alltid fysisk skilting og eventuelle
              dagsaktuelle stengninger.
            </small>
          </>
        )}
      </section>
      <div className="general-rules-heading">
        <small>GJELDER ALLE FISKERE</small>
        <h2>Generelle regler</h2>
        <p>Her finner du hele regelverket, også når personlig soneinformasjon mangler.</p>
      </div>
      <RuleCenter />
    </div>
  );
}
