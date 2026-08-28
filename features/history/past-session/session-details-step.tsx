import { FormError } from "@/components/ui/form-error";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { ZoneId } from "@/domain/zones/zone";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";

const zones = fishingContentRepository.getZones();

export function SessionDetailsStep({ controller }: { controller: PastSessionController }) {
  const { caught, date, from, subzone, subzones, to, today, touched, validTime, zone } =
    controller.state;
  const {
    setCatchAt,
    setCaught,
    setDate,
    setFrom,
    setStep,
    setSubzone,
    setTo,
    setTouched,
    setZone,
  } = controller.actions;
  return (
    <>
      <small>ETTERREGISTRERING · TUR</small>
      <h2>Når og hvor fisket du?</h2>
      <p className="past-intro">
        Registrer det faktiske tidspunktet og området så nøyaktig du kan.
      </p>
      <label>
        Dato <em>påkrevd</em>
        <input
          aria-describedby={touched && !validTime ? "past-session-error" : undefined}
          aria-invalid={touched && !validTime}
          type="date"
          max={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <div className="input-row">
        <label>
          Starttid <em>påkrevd</em>
          <input
            aria-describedby={touched && !validTime ? "past-session-error" : undefined}
            aria-invalid={touched && !validTime}
            type="time"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Sluttid <em>påkrevd</em>
          <input
            aria-describedby={touched && !validTime ? "past-session-error" : undefined}
            aria-invalid={touched && !validTime}
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
            setZone(Number(e.target.value) as ZoneId);
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
          <select
            aria-describedby={touched && !subzone ? "past-session-error" : undefined}
            aria-invalid={touched && !subzone}
            value={subzone}
            onChange={(e) => setSubzone(e.target.value)}
          >
            <option value="">Velg delsone</option>
            {subzones.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      )}
      <label>Fikk du fangst?</label>
      <div className="choice two">
        <button
          className={!caught ? "selected" : ""}
          aria-pressed={!caught}
          onClick={() => setCaught(false)}
        >
          Nei · nullfangst
        </button>
        <button
          className={caught ? "selected" : ""}
          aria-pressed={caught}
          onClick={() => setCaught(true)}
        >
          Ja · legg til fangst
        </button>
      </div>
      <FormError
        id="past-session-error"
        message={
          touched && (!validTime || (subzones.length > 0 && !subzone))
            ? "Kontroller dato, tider og eventuell delsone."
            : undefined
        }
      />
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
  );
}
