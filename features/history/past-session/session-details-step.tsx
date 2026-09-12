import { FormError } from "@/components/ui/form-error";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { ZoneId } from "@/domain/zones/zone";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { useLanguage } from "@/components/localization/language-provider";

const zones = fishingContentRepository.getZones();

export function SessionDetailsStep({ controller }: { controller: PastSessionController }) {
  const { t } = useLanguage();
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
      <small>{t("copy.etterregistrering.tur.28c8b42")}</small>
      <h2>{t("copy.nar.og.hvor.fisket.du.6b4242f")}</h2>
      <p className="past-intro">
        {t("copy.registrer.det.faktiske.tidspunktet.og.omradet.sa.3464b6a")}
      </p>
      <label>
        {t("copy.dato.aaf5660")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
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
          {t("copy.starttid.1ff941d")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
          <input
            aria-describedby={touched && !validTime ? "past-session-error" : undefined}
            aria-invalid={touched && !validTime}
            type="time"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          {t("copy.sluttid.49a5d92")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
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
        {t("copy.hovedsone.449c2c3")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
        <select
          value={zone}
          onChange={(e) => {
            setZone(Number(e.target.value) as ZoneId);
            setSubzone("");
          }}
        >
          {zones.map((z) => (
            <option value={z.id} key={z.id}>
              {t(z.name)}
            </option>
          ))}
        </select>
      </label>
      {subzones.length > 0 && (
        <label>
          {t("copy.delsone.ec5e5cb")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
          <select
            aria-describedby={touched && !subzone ? "past-session-error" : undefined}
            aria-invalid={touched && !subzone}
            value={subzone}
            onChange={(e) => setSubzone(e.target.value)}
          >
            <option value="">{t("copy.velg.delsone.8744fbc")}</option>
            {subzones.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      )}
      <label>{t("copy.fikk.du.fangst.c3aa311")}</label>
      <div className="choice two">
        <button
          className={!caught ? "selected" : ""}
          aria-pressed={!caught}
          onClick={() => setCaught(false)}
        >
          {t("copy.nei.nullfangst.3002258")}
        </button>
        <button
          className={caught ? "selected" : ""}
          aria-pressed={caught}
          onClick={() => setCaught(true)}
        >
          {t("copy.ja.legg.til.fangst.b9b578c")}
        </button>
      </div>
      <FormError
        id="past-session-error"
        message={
          touched && (!validTime || (subzones.length > 0 && !subzone))
            ? t("copy.kontroller.dato.tider.og.eventuell.delsone.c6d467e")
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
        {t(caught ? "Neste · registrer fangst" : "Neste · regelkontroll")}
      </button>
    </>
  );
}
