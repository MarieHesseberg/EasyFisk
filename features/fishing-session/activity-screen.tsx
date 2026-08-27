"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import { parseMeasurement, validateCatch } from "@/domain/catches/validate-catch";
import type { CatchRecord, SessionRecord } from "@/domain/models";
import { CatchReportDetail } from "@/features/catch-report/catch-report-detail";
import { PastSessionForm } from "@/features/history/past-session-form";
import { History } from "@/features/statistics/history-card";
import { formatClock, formatDuration, formatLongDuration } from "@/lib/time";

export function Activity({
  active,
  onStart,
  onStop,
  onAddPast,
  onCatch,
  onCatchFlowComplete,
  finishAfterCatch,
  catches,
  activeZone,
  requestedCatchTime,
  onCorrectCatch,
  onShowRules,
  lastSession,
  elapsed,
  startTime,
  embedded = false,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => void;
  onCatch: (record: CatchRecord) => void;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  elapsed: number;
  startTime: number | null;
  lastSession: SessionRecord | null;
  embedded?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [step, setStep] = useState(1);
  const [species, setSpecies] = useState("Laks");
  const [result, setResult] = useState("Gjenutsatt");
  const [length, setLength] = useState("");
  const [weight, setWeight] = useState("");
  const [comment, setComment] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageData, setImageData] = useState("");
  const [catchTime, setCatchTime] = useState(0);
  const [selectedCatch, setSelectedCatch] = useState<CatchRecord | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [touched, setTouched] = useState(false);
  const [violationConfirmed, setViolationConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const reset = () => {
    setStep(1);
    setSpecies("Laks");
    setResult("Gjenutsatt");
    setLength("");
    setWeight("");
    setComment("");
    setImageName("");
    setImageData("");
    setCatchTime(0);
    setTouched(false);
    setViolationConfirmed(false);
    setSubmitted(false);
  };
  const close = () => {
    setShow(false);
    reset();
  };
  const submitCatch = () => {
    if (submitted) return;
    onCatch({
      id: "pending",
      caughtAt: catchTime || requestedCatchTime,
      submittedAt: 0,
      sessionStart: startTime || catchTime || requestedCatchTime,
      species,
      result,
      length: lengthNo,
      weight: weightNo,
      zone: activeZone,
      violation: blocked,
      late: false,
      imageName,
      imageData,
      comment,
    });
    setSubmitted(true);
    setStep(4);
  };
  const lengthNo = parseMeasurement(length);
  const weightNo = parseMeasurement(weight);
  const { detailsValid, largeSalmon, blocked, ruleTitle, ruleText } = validateCatch(
    species,
    result,
    lengthNo,
    weightNo,
  );
  const sentCatch = submitted ? catches[catches.length - 1] : null;
  return (
    <div className={embedded ? "activity-embedded" : "screen"}>
      {!embedded && <Header title="Min aktivitet" />}
      {active ? (
        <section className="active-session">
          <span className="pulse" />
          <small>AKTIV FISKEØKT</small>
          <h2>{activeZone}</h2>
          <div className="big-time">{formatDuration(elapsed)}</div>
          <p>Startet i dag kl. {formatClock(startTime)} · GPS-sone bekreftet</p>
          <div className="session-actions">
            <button
              onClick={() => {
                setCatchTime(Date.now());
                setShow(true);
              }}
            >
              <Icon name="fish" />
              Registrer fangst
            </button>
            <button onClick={onShowRules}>
              <Icon name="map" />
              Sone og regler
            </button>
          </div>
          <button className="outline-danger" onClick={onStop}>
            Stopp · bekreft fangst eller nullfangst
          </button>
        </section>
      ) : (
        <section className="empty">
          <span>
            <Icon name="clock" size={35} />
          </span>
          <h2>Ingen aktiv fiskeøkt</h2>
          <p>Start registrerer fisketid og sone. Ved stopp bekrefter du fangst eller nullfangst.</p>
          <button className="primary" onClick={onStart}>
            Kontroller status og start
          </button>
        </section>
      )}
      <button className="past-session-button" onClick={() => setShowPast(true)}>
        <Icon name="clock" />
        <span>
          <b>Registrer tidligere fisketur</b>
          <small>For turer og fangster du glemte å registrere</small>
        </span>
        <Icon name="chevron" size={18} />
      </button>
      {catches.length > 0 && (
        <section>
          <div className="section-head">
            <h3>Siste fangster</h3>
          </div>
          {catches
            .slice()
            .reverse()
            .map((item) => (
              <button
                className="catch-history-card"
                key={item.id}
                onClick={() => setSelectedCatch(item)}
              >
                <span>
                  <Icon name="fish" />
                </span>
                <p>
                  <b>
                    {item.species} · {item.result.toLowerCase()}
                  </b>
                  <small>
                    {item.zone} · {item.length} cm · {item.weight} kg
                  </small>
                  <em>
                    {formatClock(item.caughtAt)} ·{" "}
                    {item.late ? "forsinket rapport" : "rapportert innen fristen"}
                    {item.correction ? " · rettelse meldt" : ""}
                  </em>
                </p>
                {item.violation ? (
                  <i className="catch-violation">!</i>
                ) : (
                  <Icon name="check" size={17} />
                )}
              </button>
            ))}
        </section>
      )}
      <section>
        <div className="section-head">
          <h3>Siste fiskeøkter</h3>
          <button onClick={() => setShowAllHistory(!showAllHistory)}>
            {showAllHistory ? "Vis færre" : "Se alle"}
          </button>
        </div>
        {lastSession && (
          <History
            day={String(new Date(lastSession.end).getDate()).padStart(2, "0")}
            title={lastSession.zone}
            time={`${formatClock(lastSession.start)}–${formatClock(lastSession.end)} · ${formatLongDuration(lastSession.duration)}`}
            result={lastSession.result}
          />
        )}
        <History
          day="16"
          title="Sone 2 · Fuskeland B"
          time="18:10–21:42 · 3 t 32 min"
          result="1 laks · gjenutsatt"
        />
        {showAllHistory && (
          <>
            <History
              day="08"
              title="Sone 1 · Mandal–Krossen"
              time="19:20–20:55 · 1 t 35 min"
              result="1 sjøørret · gjenutsatt"
            />
            <History
              day="03"
              title="Sone 4 · Laudal–Kavfossen"
              time="06:40–09:05 · 2 t 25 min"
              result="Nullfangst rapportert"
            />
          </>
        )}
        <History
          day="12"
          title="Sone 3 · Øyslebø–Laudal"
          time="07:15–10:03 · 2 t 48 min"
          result="Nullfangst rapportert"
        />
      </section>
      {(show || finishAfterCatch) && (
        <div className="modal-bg" onClick={finishAfterCatch ? undefined : close}>
          <div className="catch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
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
                <small>STEG 1 AV 4 · FANGST</small>
                <h2>Hva fikk du?</h2>
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
                      className={result === x ? "selected" : ""}
                      onClick={() => setResult(x)}
                    >
                      {x}
                    </button>
                  ))}
                </div>
                <div className="selection-recap">
                  <Icon name="check" size={17} />
                  <span>
                    Valgt:{" "}
                    <b>
                      {species.toLowerCase()} · {result.toLowerCase()}
                    </b>
                  </span>
                </div>
                <button className="primary" onClick={() => setStep(2)}>
                  Neste · størrelse
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <small>STEG 2 AV 4 · DETALJER</small>
                <h2>Størrelse og dokumentasjon</h2>
                <div className="input-row">
                  <label>
                    Lengde <em>påkrevd</em>
                    <input
                      inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="cm"
                      className={touched && !lengthNo ? "invalid" : ""}
                    />
                  </label>
                  <label>
                    Vekt <em>påkrevd</em>
                    <input
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="kg"
                      className={touched && !weightNo ? "invalid" : ""}
                    />
                  </label>
                </div>
                {touched && !detailsValid && (
                  <p className="field-error">Fyll inn både lengde og vekt med tall større enn 0.</p>
                )}
                <label className="upload-box">
                  <Icon name="fish" />
                  <span>
                    <b>{imageName || "Legg til bilde"}</b>
                    <small>Valgfritt · bilde av fangsten</small>
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
                <label className="comment-label">
                  Kommentar <em>valgfritt</em>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={300}
                    placeholder="For eksempel observasjoner om fisken eller fangststedet"
                  />
                  <small>{comment.length}/300</small>
                </label>
                <button
                  className="primary"
                  onClick={() => {
                    setTouched(true);
                    if (detailsValid) setStep(3);
                  }}
                >
                  Neste · regelkontroll
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <small>STEG 3 AV 4 · REGELKONTROLL</small>
                <h2>
                  {blocked ? "Avlivingen bryter størrelsesreglene" : "Rapporten er kontrollert"}
                </h2>
                <div
                  className={
                    "rule-result " + (blocked ? "blocked" : largeSalmon ? "warning" : "approved")
                  }
                >
                  <span>{blocked ? "!" : <Icon name="check" />}</span>
                  <div>
                    <b>{ruleTitle}</b>
                    <p>{ruleText}</p>
                  </div>
                </div>
                <div className="applied-rules">
                  <b>Størrelsesregler som er kontrollert</b>
                  <p>
                    <span>Minstemål</span>
                    <strong>Laks og sjøørret: 35 cm</strong>
                  </p>
                  <p>
                    <span>Fra 1. august</span>
                    <strong>Én laks opptil 90 cm</strong>
                  </p>
                  <p>
                    <span>Øvrige avlivede laks</span>
                    <strong>Under 65 cm</strong>
                  </p>
                  <small>Minstemålet er 35 cm. Regelversjon 01.08.2026 er brukt.</small>
                </div>
                <div className="report-summary">
                  <p>
                    <b>
                      {species} · {result.toLowerCase()}
                    </b>
                    <small>
                      {lengthNo} cm · {weightNo} kg
                    </small>
                  </p>
                  <p>
                    <b>{activeZone}</b>
                    <small>
                      Fangsttid {formatClock(catchTime || requestedCatchTime)} · økt og sone er lagt
                      til automatisk
                    </small>
                  </p>
                  {imageName && (
                    <p>
                      <b>Bilde vedlagt</b>
                      <small>{imageName}</small>
                    </p>
                  )}
                  {comment && (
                    <p>
                      <b>Kommentar</b>
                      <small>{comment}</small>
                    </p>
                  )}
                </div>
                {blocked ? (
                  <>
                    <label className="violation-confirm">
                      <input
                        type="checkbox"
                        checked={violationConfirmed}
                        onChange={(e) => setViolationConfirmed(e.target.checked)}
                      />
                      <span>
                        <b>Jeg forstår at avlivingen ikke var tillatt</b>
                        <small>
                          Opplysningene over er riktige, og rapporten skal vise det som faktisk
                          skjedde.
                        </small>
                      </span>
                    </label>
                    <button
                      className="primary danger-submit"
                      disabled={!violationConfirmed}
                      onClick={submitCatch}
                    >
                      Send inn faktisk fangst
                    </button>
                  </>
                ) : (
                  <button className="primary" onClick={submitCatch}>
                    Send fangstrapport
                  </button>
                )}
                <button className="secondary" onClick={() => setStep(2)}>
                  Tilbake og endre
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <div className="sent-icon">
                  <Icon name="check" size={32} />
                </div>
                <small>STEG 4 AV 4 · SENDT</small>
                <h2>Fangstrapporten er sendt</h2>
                <p className="sent-lead">
                  {sentCatch?.late
                    ? `Rapporten ble sendt ${formatLongDuration(Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000))} etter fangsten og er merket som forsinket.`
                    : `Rapporten ble sendt ${sentCatch ? formatLongDuration(Math.max(0, Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000))) : "kort tid"} etter fangsten og innen fristen på 2 timer.`}
                </p>
                {sentCatch?.late && (
                  <div className="violation-sent late">
                    <b>Forsinket fangstrapport</b>
                    <p>
                      Det faktiske fangsttidspunktet er beholdt, og innsendingstidspunktet er
                      registrert separat.
                    </p>
                  </div>
                )}
                {blocked && (
                  <div className="violation-sent">
                    <b>Rapportert regelavvik</b>
                    <p>
                      Fangsten er registrert som avlivet. Rapporten er merket for mulig oppfølging
                      fordi størrelsen er utenfor tillatt grense.
                    </p>
                  </div>
                )}
                <div className="quota-update">
                  <h3>Oppdatert kvotestatus</h3>
                  <div>
                    <span>Døgnkvote</span>
                    <b>{result === "Avlivet" ? "0 av 1 gjenstår" : "1 av 1 gjenstår"}</b>
                  </div>
                  <div>
                    <span>Sesongkvote laks</span>
                    <b>
                      {`${Math.max(0, 4 - catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length)} av 5 gjenstår`}
                    </b>
                  </div>
                </div>
                {largeSalmon && (
                  <div className="large-salmon-used">
                    <b>Storlaks-unntaket er brukt</b>
                    <span>0 av 1 gjenstår</span>
                  </div>
                )}
                <div className="report-id">
                  <small>RAPPORT-ID</small>
                  <b>{sentCatch?.id || "Oppretter rapport-ID"}</b>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    close();
                    if (finishAfterCatch) onCatchFlowComplete();
                  }}
                >
                  {finishAfterCatch ? "Se sammendrag for økten" : "Ferdig"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showPast && (
        <PastSessionForm
          onClose={() => setShowPast(false)}
          existingCatches={catches}
          onSave={(record, catchRecords) => {
            onAddPast(record, catchRecords);
          }}
        />
      )}
      {selectedCatch && (
        <CatchReportDetail
          report={selectedCatch}
          onClose={() => setSelectedCatch(null)}
          onCorrect={(note) => {
            onCorrectCatch(selectedCatch.id, note);
            setSelectedCatch({ ...selectedCatch, correction: note });
          }}
        />
      )}
    </div>
  );
}
