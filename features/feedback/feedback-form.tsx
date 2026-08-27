"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function FeedbackForm() {
  const [step, setStep] = useState(1),
    [category, setCategory] = useState(""),
    [description, setDescription] = useState(""),
    [imageName, setImageName] = useState(""),
    [position, setPosition] = useState(false),
    [touched, setTouched] = useState(false),
    [confirmed, setConfirmed] = useState(false);
  const categories = [
    "Ulovlig eller mistenkelig fiske",
    "Syk, skadet eller død fisk",
    "Forsøpling eller miljøproblem",
    "Hindring eller skade i elva",
    "Feil i kart, sone eller informasjon",
    "Annet",
  ];
  const valid = category !== "" && description.trim().length >= 10;
  if (step === 3)
    return (
      <div className="feedback-confirmation">
        <span>
          <Icon name="check" size={32} />
        </span>
        <small>MELDINGEN ER SENDT</small>
        <h3>Takk for at du meldte fra</h3>
        <p>
          Mandalselva Elveeigarlag har mottatt meldingen. Du kan bruke referansen dersom du
          kontakter laget senere.
        </p>
        <div>
          <small>REFERANSE</small>
          <b>ME-TIPS-2026-0819-047</b>
        </div>
        <button
          className="primary"
          onClick={() => {
            setStep(1);
            setCategory("");
            setDescription("");
            setImageName("");
            setPosition(false);
            setTouched(false);
            setConfirmed(false);
          }}
        >
          Send en ny melding
        </button>
      </div>
    );
  return (
    <div className="feedback-form">
      <div className="feedback-steps">
        <span className="on">1</span>
        <i />
        <span className={step >= 2 ? "on" : ""}>2</span>
        <i />
        <span className={step >= 3 ? "on" : ""}>3</span>
      </div>
      {step === 1 && (
        <>
          <div className="form-intro">
            <Icon name="bell" />
            <div>
              <b>Hva vil du melde fra om?</b>
              <p>
                Ikke bruk skjemaet ved akutt fare. Kontakt politiet eller oppsynet direkte dersom
                situasjonen pågår nå.
              </p>
            </div>
          </div>
          <label>
            Kategori <em>påkrevd</em>
          </label>
          <div className="feedback-categories">
            {categories.map((x) => (
              <button
                key={x}
                className={category === x ? "selected" : ""}
                onClick={() => setCategory(x)}
              >
                {category === x && <Icon name="check" size={14} />}
                <span>{x}</span>
              </button>
            ))}
          </div>
          <label>
            Beskrivelse <em>påkrevd</em>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Beskriv hva du observerte, hvor og omtrent når det skjedde"
            />
          </label>
          <div className="character-count">{description.length}/1000</div>
          {touched && !valid && (
            <p className="field-error">Velg kategori og skriv en beskrivelse på minst 10 tegn.</p>
          )}
          <label className="feedback-upload">
            <Icon name="fish" />
            <span>
              <b>{imageName || "Legg til bilde"}</b>
              <small>Valgfritt · JPG, PNG eller bilde fra kamera</small>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageName(e.target.files?.[0]?.name || "")}
            />
          </label>
          <div className="position-card">
            <div>
              <Icon name="pin" />
              <span>
                <b>Legg ved posisjon</b>
                <small>Valgfritt · brukes bare til denne meldingen</small>
              </span>
            </div>
            <button className={position ? "active" : ""} onClick={() => setPosition(!position)}>
              {position ? "Lagt til" : "Legg til"}
            </button>
            {position && (
              <p>
                <Icon name="check" size={14} /> Sone 3 · posisjon hentet med samtykke
              </p>
            )}
          </div>
          <button
            className="primary"
            onClick={() => {
              setTouched(true);
              if (valid) setStep(2);
            }}
          >
            Kontroller meldingen
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <small>KONTROLLER FØR INNSENDING</small>
          <h3>Er opplysningene riktige?</h3>
          <div className="feedback-review">
            <p>
              <small>KATEGORI</small>
              <b>{category}</b>
            </p>
            <p>
              <small>BESKRIVELSE</small>
              <b>{description}</b>
            </p>
            <p>
              <small>BILDE</small>
              <b>{imageName || "Ikke lagt ved"}</b>
            </p>
            <p>
              <small>POSISJON</small>
              <b>{position ? "Sone 3 · lagt ved med samtykke" : "Ikke lagt ved"}</b>
            </p>
          </div>
          <label className="privacy-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              Jeg bekrefter at opplysningene er riktige. Meldingen kan behandles av Mandalselva
              Elveeigarlag.
            </span>
          </label>
          <button className="primary" disabled={!confirmed} onClick={() => setStep(3)}>
            Send melding
          </button>
          <button className="secondary" onClick={() => setStep(1)}>
            Tilbake og endre
          </button>
        </>
      )}
    </div>
  );
}
