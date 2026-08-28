import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
const { feedback } = appContentRepository.getContent();
export function FeedbackDetailsStep({ controller }: { controller: FeedbackController }) {
  const { category, description, hasPosition, imageName, isTouched, isValid } = controller.state;
  const { setCategory, setDescription, setHasPosition, setImageName, setIsTouched, setStep } =
    controller.actions;
  return (
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
        {feedback.categories.map((option) => (
          <button
            key={option}
            className={category === option ? "selected" : ""}
            aria-pressed={category === option}
            onClick={() => setCategory(option)}
          >
            {category === option && <Icon name="check" size={14} />}
            <span>{option}</span>
          </button>
        ))}
      </div>
      <label>
        Beskrivelse <em>påkrevd</em>
        <textarea
          aria-describedby={isTouched && !isValid ? "feedback-error" : undefined}
          aria-invalid={isTouched && !isValid}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
          placeholder="Beskriv hva du observerte, hvor og omtrent når det skjedde"
        />
      </label>
      <div className="character-count">{description.length}/1000</div>
      {isTouched && !isValid && (
        <p className="field-error" id="feedback-error" role="alert">
          Velg kategori og skriv en beskrivelse på minst 10 tegn.
        </p>
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
          onChange={(event) => setImageName(event.target.files?.[0]?.name || "")}
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
        <button
          className={hasPosition ? "active" : ""}
          aria-pressed={hasPosition}
          onClick={() => setHasPosition(!hasPosition)}
        >
          {hasPosition ? "Lagt til" : "Legg til"}
        </button>
        {hasPosition && (
          <p>
            <Icon name="check" size={14} /> {feedback.positionLabel} · posisjon hentet med samtykke
          </p>
        )}
      </div>
      <button
        className="primary"
        onClick={() => {
          setIsTouched(true);
          if (isValid) setStep(2);
        }}
      >
        Kontroller meldingen
      </button>
    </>
  );
}
