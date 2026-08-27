"use client";

import { useState } from "react";
import { CheckRow } from "@/components/ui/check-row";
import { Icon } from "@/components/ui/icon";
import { zones } from "@/data/mock/fishing-data";
import { isReportLate } from "@/domain/catches/reporting-deadline";
import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchRecord, SessionRecord } from "@/domain/models";
import { getQuotaStatus } from "@/domain/quotas/get-quota-status";
import { createSessionRecord } from "@/domain/sessions/create-session-record";
import { isCatchWithinSession, isValidSessionTime } from "@/domain/sessions/session-timing";
import { getSubzones, isDateWithinZoneSeason } from "@/domain/zones/zone-rules";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";

export function PastSessionForm({
  onClose,
  onSave,
  existingCatches,
}: {
  onClose: () => void;
  onSave: (record: SessionRecord, catches?: CatchRecord[]) => void;
  existingCatches: CatchRecord[];
}) {
  const [openedAt] = useState(() => Date.now()),
    today = new Date(openedAt).toISOString().slice(0, 10);
  const [step, setStep] = useState(1),
    [date, setDate] = useState(today),
    [from, setFrom] = useState("17:00"),
    [to, setTo] = useState("19:00"),
    [zone, setZone] = useState(3),
    [subzone, setSubzone] = useState(""),
    [caught, setCaught] = useState(false),
    [catchAt, setCatchAt] = useState("18:00"),
    [species, setSpecies] = useState("Laks"),
    [outcome, setOutcome] = useState("Gjenutsatt"),
    [length, setLength] = useState(""),
    [weight, setWeight] = useState(""),
    [comment, setComment] = useState(""),
    [imageName, setImageName] = useState(""),
    [imageData, setImageData] = useState(""),
    [reports, setReports] = useState<CatchRecord[]>([]),
    [touched, setTouched] = useState(false);
  const dialogRef = useDialogAccessibility(step === 4 ? onClose : undefined);
  const start = new Date(`${date}T${from}`).getTime(),
    end = new Date(`${date}T${to}`).getTime(),
    caughtAt = new Date(`${date}T${catchAt}`).getTime(),
    validTime = Boolean(date && from && to && isValidSessionTime(start, end, openedAt)),
    validCatchTime = isCatchWithinSession(caughtAt, start, end),
    lengthNo = parseMeasurement(length),
    weightNo = parseMeasurement(weight),
    zoneBase = zones.find((z) => z.id === zone)?.name || `Sone ${zone}`,
    zoneName = subzone ? `${zoneBase} · ${subzone}` : zoneBase,
    withinSeason = isDateWithinZoneSeason(date, zone),
    permitValid = withinSeason,
    closedHistorically = false,
    quota = getQuotaStatus(existingCatches, reports),
    quotaAvailable = quota.seasonAvailable,
    dailyValid = quota.dailyValid,
    catchValid = validateCatch(species, outcome, lengthNo, weightNo).detailsValid && validCatchTime;
  const resetCatch = () => {
    setSpecies("Laks");
    setOutcome("Gjenutsatt");
    setLength("");
    setWeight("");
    setComment("");
    setImageName("");
    setImageData("");
    setCatchAt(to);
  };
  const addCatch = (review: boolean) => {
    setTouched(true);
    if (!catchValid) return;
    const violation = validateCatch(species, outcome, lengthNo, weightNo).blocked;
    const record: CatchRecord = {
      id: `ME-ETTER-${openedAt}-${reports.length + 1}`,
      caughtAt,
      submittedAt: openedAt,
      sessionStart: start,
      species,
      result: outcome,
      length: lengthNo,
      weight: weightNo,
      zone: zoneName,
      violation,
      late: isReportLate(caughtAt, openedAt),
      imageName,
      imageData,
      comment,
    };
    setReports((current) => [...current, record]);
    resetCatch();
    setTouched(false);
    setStep(review ? 3 : 2);
  };
  const submit = () => {
    const result = reports.length
      ? `${reports.length} fangst${reports.length === 1 ? "" : "er"} · etterregistrert`
      : "Nullfangst · etterregistrert";
    onSave(createSessionRecord(start, end, zoneName, result), reports);
    setStep(4);
  };
  const subzones = getSubzones(zone);
  return (
    <div className="modal-bg" onClick={step === 4 ? onClose : undefined}>
      <div
        ref={dialogRef}
        className="catch-modal past-session-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Registrer tidligere fisketur"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Lukk registrering" onClick={onClose}>
          ×
        </button>
        <div className="steps four">
          <span className={step >= 1 ? "on" : ""}>1</span>
          <i />
          <span className={step >= 2 ? "on" : ""}>2</span>
          <i />
          <span className={step >= 3 ? "on" : ""}>3</span>
          <i />
          <span className={step >= 4 ? "on" : ""}>4</span>
        </div>
        {step === 1 && (
          <>
            <small>ETTERREGISTRERING · TUR</small>
            <h2>Når og hvor fisket du?</h2>
            <p className="past-intro">
              Registrer det faktiske tidspunktet og området så nøyaktig du kan.
            </p>
            <label>
              Dato <em>påkrevd</em>
              <input
                type="date"
                max={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <div className="input-row">
              <label>
                Starttid <em>påkrevd</em>
                <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                Sluttid <em>påkrevd</em>
                <input
                  type="time"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setCatchAt(e.target.value);
                  }}
                />
              </label>
            </div>
            <label>
              Hovedsone <em>påkrevd</em>
              <select
                value={zone}
                onChange={(e) => {
                  setZone(Number(e.target.value));
                  setSubzone("");
                }}
              >
                {zones.map((z) => (
                  <option value={z.id} key={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </label>
            {subzones.length > 0 && (
              <label>
                Delsone <em>påkrevd</em>
                <select value={subzone} onChange={(e) => setSubzone(e.target.value)}>
                  <option value="">Velg delsone</option>
                  {subzones.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            )}
            <label>Fikk du fangst?</label>
            <div className="choice two">
              <button className={!caught ? "selected" : ""} onClick={() => setCaught(false)}>
                Nei · nullfangst
              </button>
              <button className={caught ? "selected" : ""} onClick={() => setCaught(true)}>
                Ja · legg til fangst
              </button>
            </div>
            {touched && (!validTime || (subzones.length > 0 && !subzone)) && (
              <p className="field-error">Kontroller dato, tider og eventuell delsone.</p>
            )}
            <button
              className="primary"
              onClick={() => {
                setTouched(true);
                if (validTime && (!subzones.length || subzone)) setStep(caught ? 2 : 3);
              }}
            >
              {caught ? "Neste · registrer fangst" : "Neste · regelkontroll"}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <small>ETTERREGISTRERING · FANGST {reports.length + 1}</small>
            <h2>Registrer fangsten</h2>
            {reports.length > 0 && (
              <div className="added-catches">
                <b>
                  {reports.length} fangst{reports.length === 1 ? "" : "er"} lagt til
                </b>
                {reports.map((x) => (
                  <span key={x.id}>
                    {x.species} · {x.result.toLowerCase()} · {formatClock(x.caughtAt)}
                  </span>
                ))}
              </div>
            )}
            <label>
              Faktisk fangsttid <em>påkrevd</em>
              <input type="time" value={catchAt} onChange={(e) => setCatchAt(e.target.value)} />
            </label>
            <label>Art</label>
            <div className="choice">
              {["Laks", "Sjøørret", "Annen art"].map((x) => (
                <button
                  key={x}
                  className={species === x ? "selected" : ""}
                  onClick={() => setSpecies(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <label>Resultat</label>
            <div className="choice two">
              {["Gjenutsatt", "Avlivet"].map((x) => (
                <button
                  key={x}
                  className={outcome === x ? "selected" : ""}
                  onClick={() => setOutcome(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="input-row">
              <label>
                Lengde <em>påkrevd</em>
                <input
                  inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="cm"
                />
              </label>
              <label>
                Vekt <em>påkrevd</em>
                <input
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg"
                />
              </label>
            </div>
            <label className="feedback-upload">
              <Icon name="fish" />
              <span>
                <b>{imageName || "Legg til bilde"}</b>
                <small>Valgfritt · lagres med fangstrapporten</small>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImageName(file?.name || "");
                  if (!file) return setImageData("");
                  const reader = new FileReader();
                  reader.onload = () => setImageData(String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <label>
              Kommentar <em>valgfritt</em>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
                placeholder="Observasjoner om fisken eller fangststedet"
              />
            </label>
            {touched && !catchValid && (
              <p className="field-error">
                Fangsttid må være innenfor turen. Lengde og vekt må fylles ut.
              </p>
            )}
            <button className="primary" onClick={() => addCatch(true)}>
              Legg til og kontroller turen
            </button>
            <button className="secondary" onClick={() => addCatch(false)}>
              Lagre og legg til en fangst til
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <small>HISTORISK REGELKONTROLL</small>
            <h2>Kontroller turen før innsending</h2>
            <div className="flow-checks">
              <CheckRow
                title="Fiskekort på valgt dato"
                sub={
                  permitValid
                    ? `Døgnkort funnet for ${zoneName}`
                    : "Finner ikke gyldig fiskekort i kortarkivet"
                }
                state={permitValid ? "ok" : "error"}
              />
              <CheckRow
                title="Fiskesesong"
                sub={
                  withinSeason
                    ? `Datoen er innenfor sesongen i ${zoneBase}`
                    : `Valgt dato er utenfor sesongen 1. juni–${zone === 4 ? "15. september" : "31. august"}`
                }
                state={withinSeason ? "ok" : "error"}
              />
              <CheckRow
                title="Historisk stengning"
                sub={
                  closedHistorically
                    ? "Sonen var registrert som stengt"
                    : "Ingen stengning registrert på valgt tidspunkt"
                }
                state={closedHistorically ? "error" : "ok"}
              />
              <CheckRow
                title="Sesongkvote"
                sub={
                  quotaAvailable
                    ? `${quota.remaining} av 5 avlivet gjenstår etter rapporten`
                    : "Sesongkvoten kan være nådd"
                }
                state={quotaAvailable ? "ok" : "warning"}
              />
              <CheckRow
                title="Døgnkvote"
                sub={
                  dailyValid
                    ? "Maks én avlivet laks denne turen"
                    : "Flere enn én avlivet laks er registrert"
                }
                state={dailyValid ? "ok" : "error"}
              />
              <CheckRow
                title="Rapporteringsfrist"
                sub={`Etterregistreres omtrent ${formatLongDuration(Math.max(0, Math.floor((openedAt - end) / 1000)))} etter turen`}
                state="warning"
              />
            </div>
            {reports.length > 0 ? (
              <div className="added-catches review">
                {reports.map((x, i) => (
                  <button
                    key={x.id}
                    onClick={() => {
                      setReports(reports.filter((r) => r.id !== x.id));
                      setStep(2);
                    }}
                  >
                    <b>
                      Fangst {i + 1}: {x.species} · {x.result.toLowerCase()}
                    </b>
                    <span>
                      {formatClock(x.caughtAt)} · {x.length} cm · {x.weight} kg
                    </span>
                    <em>Fjern og registrer på nytt</em>
                  </button>
                ))}
              </div>
            ) : (
              <div className="selection-recap">
                <Icon name="check" size={17} />
                <span>Nullfangst registreres for turen</span>
              </div>
            )}
            <div className="late-report-note">
              <Icon name="clock" size={18} />
              <p>
                <b>Rapporten blir merket som etterregistrert</b>
                <span>Faktisk tur- og fangsttid beholdes. Innsendingstid registreres separat.</span>
              </p>
            </div>
            <button className="primary" onClick={submit}>
              Send inn tur og {reports.length} fangst{reports.length === 1 ? "" : "er"}
            </button>
            {caught && (
              <button className="secondary" onClick={() => setStep(2)}>
                Legg til en fangst til
              </button>
            )}
            <button className="text-button" onClick={() => setStep(1)}>
              Tilbake til turen
            </button>
          </>
        )}
        {step === 4 && (
          <>
            <div className="sent-icon">
              <Icon name="check" size={32} />
            </div>
            <small>ETTERREGISTRERINGEN ER SENDT</small>
            <h2>Tur og fangster er registrert</h2>
            <p className="sent-lead">
              Den tidligere fisketuren er lagt til i historikken. Alle fangster er merket som
              etterregistrert.
            </p>
            <div className="report-id">
              <small>ØKT</small>
              <b>
                {new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "long" }).format(
                  new Date(start),
                )}{" "}
                · {from}–{to}
              </b>
            </div>
            {reports.map((x, i) => (
              <div className="report-id" key={x.id}>
                <small>RAPPORT-ID · FANGST {i + 1}</small>
                <b>{x.id}</b>
              </div>
            ))}
            <button className="primary" onClick={onClose}>
              Åpne historikken
            </button>
          </>
        )}
      </div>
    </div>
  );
}
