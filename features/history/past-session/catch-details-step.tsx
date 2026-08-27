import { Icon } from "@/components/ui/icon";
import type { CatchOutcome, FishSpecies } from "@/domain/catches/catch";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { formatClock } from "@/lib/time";

const speciesOptions: readonly FishSpecies[] = ["Laks", "Sjøørret", "Annen art"];
const outcomeOptions: readonly CatchOutcome[] = ["Gjenutsatt", "Avlivet"];

export function CatchDetailsStep({ controller }: { controller: PastSessionController }) {
  const {
    catchAt,
    catchValid,
    comment,
    imageName,
    length,
    lengthNumber,
    outcome,
    reports,
    species,
    touched,
    validCatchTime,
    weight,
    weightNumber,
  } = controller.state;
  const {
    addCatch,
    selectImage,
    setCatchAt,
    setComment,
    setLength,
    setOutcome,
    setSpecies,
    setStep,
    setWeight,
  } = controller.actions;
  return (
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
        <input
          aria-describedby={touched && !catchValid ? "past-catch-error" : undefined}
          aria-invalid={touched && !validCatchTime}
          type="time"
          value={catchAt}
          onChange={(e) => setCatchAt(e.target.value)}
        />
      </label>
      <label>Art</label>
      <div className="choice">
        {speciesOptions.map((x) => (
          <button
            key={x}
            className={species === x ? "selected" : ""}
            aria-pressed={species === x}
            onClick={() => setSpecies(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <label>Resultat</label>
      <div className="choice two">
        {outcomeOptions.map((x) => (
          <button
            key={x}
            className={outcome === x ? "selected" : ""}
            aria-pressed={outcome === x}
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
            aria-describedby={touched && !catchValid ? "past-catch-error" : undefined}
            aria-invalid={touched && !lengthNumber}
            inputMode="decimal"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="cm"
          />
        </label>
        <label>
          Vekt <em>påkrevd</em>
          <input
            aria-describedby={touched && !catchValid ? "past-catch-error" : undefined}
            aria-invalid={touched && !weightNumber}
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
          onChange={(event) => selectImage(event.target.files?.[0])}
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
        <p className="field-error" id="past-catch-error" role="alert">
          Fangsttid må være innenfor turen. Lengde og vekt må fylles ut.
        </p>
      )}
      <button className="primary" onClick={() => addCatch(true)}>
        Legg til og kontroller turen
      </button>
      <button className="secondary" onClick={() => addCatch(false)}>
        Lagre og legg til en fangst til
      </button>
      <button className="text-button" onClick={() => setStep(1)}>
        Tilbake
      </button>
    </>
  );
}
