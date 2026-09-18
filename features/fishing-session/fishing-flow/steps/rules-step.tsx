"use client";
import { selectLocalized } from "@/locales";
import {
  acceptCurrentRules,
  hasPreviousRuleAcceptance,
} from "@/domain/fishing-rules/rule-acceptance";
import { useState } from "react";
import { FlowTitle } from "@/components/ui/flow-title";
import type { ZoneId } from "@/domain/zones/zone";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { useLanguage } from "@/components/localization/language-provider";
export function RulesStep({
  back,
  finish,
  selectedZone,
}: {
  back: () => void;
  finish: (selectedZone: ZoneId) => void;
  selectedZone: ZoneId;
}) {
  const { language, t } = useLanguage();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const { quota, reporting } = activeFishingRules;
  return (
    <>
      <FlowTitle
        icon="book"
        eyebrow={t("copy.regler.for.valgt.sone.44737ce")}
        title={selectLocalized(
          language,
          `Før du starter i Sone ${selectedZone}`,
          `Before you start in Zone ${selectedZone}`,
        )}
        text={t("copy.bekreft.at.du.har.lest.de.viktigste.reglene.for..ae65cba")}
      />
      {hasPreviousRuleAcceptance() && (
        <p role="alert">
          {selectLocalized(
            language,
            "Fiskereglene er endret siden sist. Les og bekreft den nye versjonen før du starter.",
            "The fishing rules have changed. Read and accept the new version before starting.",
          )}
        </p>
      )}
      <p>
        {selectLocalized(language, "Regelversjon", "Rule version")}:{" "}
        {activeFishingRules.metadata.versionLabel}
      </p>
      <a href={activeFishingRules.sources.localRules} target="_blank" rel="noreferrer">
        {selectLocalized(language, "Les alle lokale regler", "Read all local rules")}
      </a>
      {error && <p role="alert">{error}</p>}
      <div className="session-rules">
        <p>
          <b>{t("copy.redskap.48ea2b4")}</b>
          <span>{t("copy.flue.sluk.og.mark.mothakel.s.krok.sirkelkrok.ved.4e9b160")}</span>
        </p>
        <p>
          <b>{t("copy.kvote.6932153")}</b>
          <span>
            {selectLocalized(
              language,
              `${quota.killedSalmonPerDay} avlivet laks per fiskerdøgn. Maks ${quota.releasedSalmonPerDay} gjenutsatte laks.`,
              `${quota.killedSalmonPerDay} harvested salmon per fishing day. Maximum ${quota.releasedSalmonPerDay} released salmon.`,
            )}
          </span>
        </p>
        <p>
          <b>{t("copy.fangst.04050e7")}</b>
          <span>
            {selectLocalized(
              language,
              `Rapporteres så raskt som mulig og innen ${reporting.deadlineHours} timer.`,
              `Report as soon as possible and within ${reporting.deadlineHours} hours.`,
            )}
          </span>
        </p>
        <p>
          <b>{t("copy.bevegelig.fiske.35e6b00")}</b>
          <span>{t("copy.flytt.deg.noen.meter.nedstr.ms.etter.hvert.kast.51a774e")}</span>
        </p>
      </div>
      <label className="confirm-line">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />{" "}
        {t("copy.jeg.har.lest.og.forstatt.reglene.5497ce6")}
      </label>
      <button
        className="primary start-final"
        disabled={!confirmed}
        onClick={() => {
          try {
            acceptCurrentRules();
            finish(selectedZone);
          } catch {
            setError(
              selectLocalized(
                language,
                "Bekreftelsen kunne ikke lagres. Prøv igjen.",
                "Could not save acceptance. Please try again.",
              ),
            );
          }
        }}
      >
        {selectLocalized(language, "Start fiske i Sone", "Start fishing in Zone")} {selectedZone}
      </button>
      <button className="text-button" onClick={back}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
