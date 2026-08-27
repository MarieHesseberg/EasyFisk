"use client";

import { useState } from "react";

import { FlowTitle } from "@/components/ui/flow-title";
import type { ZoneId } from "@/domain/zones/zone";

export function RulesStep({
  back,
  finish,
  selectedZone,
}: {
  back: () => void;
  finish: (selectedZone: ZoneId) => void;
  selectedZone: ZoneId;
}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <>
      <FlowTitle
        icon="book"
        eyebrow="REGLER FOR VALGT SONE"
        title={"Før du starter i Sone " + selectedZone}
        text="Bekreft at du har lest de viktigste reglene for denne økten."
      />
      <div className="session-rules">
        <p>
          <b>Redskap</b>
          <span>Flue, sluk og mark. Mothakeløs krok. Sirkelkrok ved markfiske.</span>
        </p>
        <p>
          <b>Kvote</b>
          <span>1 avlivet laks per fiskerdøgn. Maks 2 gjenutsatte laks.</span>
        </p>
        <p>
          <b>Fangst</b>
          <span>Rapporteres så raskt som mulig og innen 2 timer.</span>
        </p>
        <p>
          <b>Bevegelig fiske</b>
          <span>Flytt deg noen meter nedstrøms etter hvert kast.</span>
        </p>
      </div>
      <label className="confirm-line">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />{" "}
        Jeg har lest og forstått reglene
      </label>
      <button
        className="primary start-final"
        disabled={!confirmed}
        onClick={() => finish(selectedZone)}
      >
        Start fiske i Sone {selectedZone}
      </button>
      <button className="text-button" onClick={back}>
        Tilbake
      </button>
    </>
  );
}
