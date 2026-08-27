"use client";

import { useState } from "react";
import { CheckRow } from "@/components/ui/check-row";
import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";
import { demoStatuses, zones } from "@/data/mock/fishing-data";
import type { DemoStatus, FlowMode, SessionRecord } from "@/domain/models";
import { formatClock, formatLongDuration } from "@/lib/time";

export function FishingFlow({
  mode,
  finish,
  cancel,
  demoStatus,
  startTime,
  elapsed,
  lastSession,
  resolveBlock,
}: {
  mode: FlowMode;
  finish: (caught?: boolean, selectedZone?: number) => void;
  cancel: () => void;
  demoStatus: DemoStatus;
  startTime: number | null;
  elapsed: number;
  lastSession: SessionRecord | null;
  resolveBlock: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedZone, setSelectedZone] = useState(3);
  const scenario = demoStatuses.find((s) => s.id === demoStatus)!;
  const blocked = scenario.level === "blocked";
  const total = mode === "start" ? 4 : mode === "stop" ? 1 : 1;
  return (
    <div className="flow-overlay">
      <div className="flow-sheet">
        <div className="flow-top">
          <button onClick={cancel} aria-label="Lukk">
            ×
          </button>
          <span>
            {mode === "start" ? "START FISKE" : mode === "stop" ? "AVSLUTT ØKT" : "ØKT FULLFØRT"}
          </span>
          <em>{mode === "summary" ? "Ferdig" : `${step} av ${total}`}</em>
        </div>
        {mode === "start" && (
          <div className="flow-content">
            {step === 1 && (
              <>
                <FlowTitle
                  icon="shield"
                  eyebrow="STATUSKONTROLL"
                  title={scenario.title}
                  text={scenario.detail}
                />
                <div className={"scenario-banner " + scenario.level}>
                  <b>
                    {blocked
                      ? "Kan ikke starte"
                      : scenario.level === "warning"
                        ? "Krever bekreftelse"
                        : "Alle kontroller er godkjent"}
                  </b>
                  <span>{scenario.label}</span>
                </div>
                <div className="flow-checks">
                  <CheckRow
                    title="Fiskekort · Sone 3"
                    sub={
                      demoStatus === "noPermit"
                        ? "Ikke funnet"
                        : demoStatus === "wrongZone"
                          ? "Kortet gjelder Sone 2"
                          : "Gyldig til kl. 17:59"
                    }
                    state={["noPermit", "wrongZone"].includes(demoStatus) ? "error" : "ok"}
                  />
                  <CheckRow
                    title="Statlig fiskeravgift"
                    sub={demoStatus === "noFee" ? "Ikke dokumentert" : "Betalt og dokumentert"}
                    state={demoStatus === "noFee" ? "error" : "ok"}
                  />
                  <CheckRow
                    title="Desinfisering"
                    sub={
                      demoStatus === "expiredDisinfection"
                        ? "Utløpt"
                        : demoStatus === "otherRiver"
                          ? "Nytt vassdrag registrert"
                          : "Gyldig · ikke besøkt annet vassdrag"
                    }
                    state={
                      ["expiredDisinfection", "otherRiver"].includes(demoStatus) ? "error" : "ok"
                    }
                  />
                  <CheckRow
                    title="Kvoter og rapportering"
                    sub={
                      demoStatus === "dailyQuota"
                        ? "Døgnkvote nådd"
                        : demoStatus === "seasonQuota"
                          ? "Sesongkvote nådd"
                          : demoStatus === "lateReport"
                            ? "Forsinket fangstrapport"
                            : "Kvoter tilgjengelig · rapporter ajour"
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
                    title="Temperatur og stengning"
                    sub={
                      demoStatus === "hotWater"
                        ? "21,4 °C · fisket er stanset"
                        : demoStatus === "closed"
                          ? "Aktivt stengningsvarsel"
                          : "11 °C · elva er åpen"
                    }
                    state={["hotWater", "closed"].includes(demoStatus) ? "error" : "ok"}
                  />
                  <CheckRow title="Fiskesesong" sub="Sone 3 · 1. juni–31. august" />
                </div>
                {blocked ? (
                  <>
                    <button className="primary blocked-action" onClick={resolveBlock}>
                      {scenario.action}
                    </button>
                    <button className="secondary" onClick={cancel}>
                      Avbryt oppstart
                    </button>
                  </>
                ) : (
                  <button className="primary" onClick={() => setStep(2)}>
                    {scenario.level === "warning"
                      ? "Jeg forstår · fortsett"
                      : "Fortsett til posisjon"}
                  </button>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <FlowTitle
                  icon="pin"
                  eyebrow="POSISJON"
                  title="Finn riktig fiskesone"
                  text="Posisjonen brukes én gang for å foreslå sone. Kontinuerlig sporing er ikke nødvendig."
                />
                <div className="permission-card">
                  <Icon name="pin" size={30} />
                  <b>Tillat posisjon når du starter</b>
                  <p>EasyFisk lagrer bare sone og valgfri startposisjon sammen med økten.</p>
                </div>
                <button className="primary" onClick={() => setStep(3)}>
                  Tillat og finn sone
                </button>
                <button className="secondary" onClick={() => setStep(3)}>
                  Velg sone manuelt
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <FlowTitle
                  icon="map"
                  eyebrow="SONEFORSLAG"
                  title={demoStatus === "zoneBorder" ? "Du er nær en sonegrense" : "Vi fant Sone 3"}
                  text={
                    demoStatus === "zoneBorder"
                      ? "GPS-posisjonen kan ligge i Sone 2 eller Sone 3. Velg sonen som stemmer med fysisk skilting."
                      : "Posisjonen din ser ut til å være i Sone 3 mellom Øyslebø og Laudal."
                  }
                />
                {demoStatus === "zoneBorder" && (
                  <div className="scenario-banner warning">
                    <b>GPS-treffet er usikkert</b>
                    <span>Ca. 18 meter fra registrert sonegrense</span>
                  </div>
                )}
                <div className="zone-confirm">
                  <div className={"mini-map " + (demoStatus === "zoneBorder" ? "border-hit" : "")}>
                    <span>{demoStatus === "zoneBorder" ? "NÆR SONEGRENSE" : "DIN POSISJON"}</span>
                    <i />
                  </div>
                  <label>Hovedsone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(Number(e.target.value))}
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                  {selectedZone === 2 && (
                    <>
                      <label>Delsone</label>
                      <select>
                        <option>Fuskeland B</option>
                        <option>Hauge</option>
                        <option>Holmesland</option>
                        <option>Nøding</option>
                      </select>
                    </>
                  )}
                </div>
                <p className="auto-note">
                  <Icon name="book" size={17} /> Kontroller fysisk skilting dersom du står nær en
                  grense.
                </p>
                <button className="primary" onClick={() => setStep(4)}>
                  Bekreft sone og se regler
                </button>
              </>
            )}
            {step === 4 && (
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
                  <input type="checkbox" defaultChecked /> Jeg har lest og forstått reglene
                </label>
                <button
                  className="primary start-final"
                  onClick={() => finish(undefined, selectedZone)}
                >
                  Start fiske i Sone {selectedZone}
                </button>
              </>
            )}
          </div>
        )}
        {mode === "stop" && (
          <div className="flow-content">
            <FlowTitle
              icon="clock"
              eyebrow="AVSLUTT FISKEØKT"
              title="Fikk du fangst?"
              text="Alle økter lagres, også når du ikke fikk fisk. Dette gir bedre kunnskap om fiskeinnsatsen."
            />
            <div className="stop-summary">
              <span>
                <small>SONE</small>
                <b>Sone 3</b>
              </span>
              <span>
                <small>START</small>
                <b>{formatClock(startTime)}</b>
              </span>
              <span>
                <small>VARIGHET</small>
                <b>{formatLongDuration(elapsed)}</b>
              </span>
            </div>
            <button className="primary" onClick={() => finish(false)}>
              Nei · registrer nullfangst
            </button>
            <button className="secondary" onClick={() => finish(true)}>
              Ja · registrer manglende fangst
            </button>
            <button className="text-button" onClick={cancel}>
              Fortsett å fiske
            </button>
          </div>
        )}
        {mode === "summary" && lastSession && (
          <div className="flow-content">
            <FlowTitle
              icon="check"
              eyebrow="ØKTEN ER LAGRET"
              title="Takk for rapporteringen"
              text="Fiskeaktiviteten er lagret og lagt til i økthistorikken."
            />
            <div className="final-summary">
              <div>
                <small>SONE</small>
                <b>{lastSession.zone}</b>
              </div>
              <div>
                <small>TIDSPUNKT</small>
                <b>
                  {formatClock(lastSession.start)}–{formatClock(lastSession.end)}
                </b>
              </div>
              <div>
                <small>VARIGHET</small>
                <b>{formatLongDuration(lastSession.duration)}</b>
              </div>
              <div>
                <small>FANGST</small>
                <b>{lastSession.result}</b>
              </div>
              <div>
                <small>RAPPORTSTATUS</small>
                <b className="green">Fullført og registrert</b>
              </div>
            </div>
            <button className="primary" onClick={() => finish()}>
              Tilbake til oversikten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
