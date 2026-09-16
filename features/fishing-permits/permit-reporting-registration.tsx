"use client";
import { selectLocalized } from "@/locales";
import { useMemo, useState } from "react";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import {
  createPermitReportingDay,
  findQualifyingSeasonPermit,
  permitReportingOutcomeLabels,
  type PermitReportingDay,
  type PermitReportingOutcome,
} from "@/domain/fishing-permits/permit-reporting-day";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { OperationResult } from "@/domain/shared/operation-result";
import { useLanguage } from "@/components/localization/language-provider";
export function PermitReportingRegistration({
  product,
  initialSelectedDate,
  initialOutcome,
  onDateChange,
  onOutcomeChange,
  documents,
  back,
  save,
}: {
  product: PrototypePermitProduct;
  initialSelectedDate?: string;
  initialOutcome?: PermitReportingOutcome;
  onDateChange?: (date: string) => void;
  onOutcomeChange?: (outcome: PermitReportingOutcome) => void;
  documents: FishingDocument[];
  back: () => void;
  save: (record: PermitReportingDay) => OperationResult<void>;
}) {
  const { language, t } = useLanguage();
  const [fishingDate, setFishingDate] = useState(
    () =>
      initialSelectedDate ??
      new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()),
  );
  const [outcome, setOutcome] = useState<PermitReportingOutcome>(initialOutcome ?? "pending");
  const [message, setMessage] = useState("");
  const seasonPermit = useMemo(
    () => findQualifyingSeasonPermit(documents, product, fishingDate),
    [documents, fishingDate, product],
  );
  function submit() {
    if (!seasonPermit) return;
    const record = {
      ...createPermitReportingDay(product, fishingDate, seasonPermit.id),
      outcome,
    };
    const result = save(record);
    setMessage(
      result.ok
        ? selectLocalized(
            language,
            outcome === "pending"
              ? "Rapporteringsdøgnet er registrert. Fangst eller nullfangst kan føres senere."
              : outcome === "catch"
                ? "Rapporteringsdøgnet er registrert med fangststatus."
                : "Rapporteringsdøgnet er registrert som nullfangst.",
            outcome === "pending"
              ? "The reporting day has been registered. A catch or no catch can be recorded later."
              : outcome === "catch"
                ? "The reporting day has been registered with a catch."
                : "The reporting day has been registered with no catch.",
          )
        : t(result.error),
    );
  }
  return (
    <section className="permit-checkout" aria-label={t("copy.registrer.rapporteringsd.gn.9349d4d")}>
      <button className="back" type="button" onClick={back}>
        {t("copy.tilbake.til.fiskekort.bcb4b52")}
      </button>
      <div className="permit-test-warning">
        <b>{t("copy.rapporteringskort.ingen.betaling.6290b3a")}</b>
        <span>{t("copy.dette.registrerer.et.fisked.gn.for.et.eksisteren.efaab3e")}</span>
      </div>
      <article>
        <small>{t(product.areaName)}</small>
        <h3>{t(product.title)}</h3>
        <p>{t(product.validity.label)}</p>
      </article>
      <label className="permit-test-date">
        {t("copy.fiskedato.bc8f11c")}
        <input
          type="date"
          value={fishingDate}
          onChange={(event) => {
            setFishingDate(event.target.value);
            onDateChange?.(event.target.value);
            setMessage("");
          }}
        />
      </label>
      {!seasonPermit ? (
        <div className="permit-payment-result error" role="alert">
          <b>{t("copy.gyldig.sesongkort.mangler.a77ca4f")}</b>
          <span>
            {selectLocalized(
              language,
              `Registrer et sesongkort for ${product.areaName} som dekker valgt fiskedøgn.`,
              `Register a season permit for ${t(product.areaName)} that covers the selected fishing day.`,
            )}
          </span>
        </div>
      ) : (
        <fieldset>
          <legend>{t("copy.rapportstatus.f17eed4")}</legend>
          {Object.entries(permitReportingOutcomeLabels).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="reporting-outcome"
                checked={outcome === value}
                onChange={() => {
                  setOutcome(value as PermitReportingOutcome);
                  onOutcomeChange?.(value as PermitReportingOutcome);
                  setMessage("");
                }}
              />
              {t(label)}
            </label>
          ))}
        </fieldset>
      )}
      <button className="primary" type="button" disabled={!seasonPermit} onClick={submit}>
        {t("copy.registrer.rapporteringsd.gn.9349d4d")}
      </button>
      {message && (
        <div className="permit-payment-result success" role="status" aria-live="polite">
          {message}
        </div>
      )}
    </section>
  );
}
