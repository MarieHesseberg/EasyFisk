"use client";

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

export function PermitReportingRegistration({
  product,
  documents,
  back,
  save,
}: {
  product: PrototypePermitProduct;
  documents: FishingDocument[];
  back: () => void;
  save: (record: PermitReportingDay) => OperationResult<void>;
}) {
  const [fishingDate, setFishingDate] = useState(() =>
    new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()),
  );
  const [outcome, setOutcome] = useState<PermitReportingOutcome>("pending");
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
        ? outcome === "pending"
          ? "Rapporteringsdøgnet er registrert. Fangst eller nullfangst kan føres senere."
          : outcome === "catch"
            ? "Rapporteringsdøgnet er registrert med fangststatus."
            : "Rapporteringsdøgnet er registrert som nullfangst."
        : result.error,
    );
  }

  return (
    <section className="permit-checkout" aria-label="Registrer rapporteringsdøgn">
      <button className="back" type="button" onClick={back}>
        ‹ Tilbake til fiskekort
      </button>
      <div className="permit-test-warning">
        <b>Rapporteringskort – ingen betaling</b>
        <span>Dette registrerer et fiskedøgn for et eksisterende sesongkort.</span>
      </div>
      <article>
        <small>{product.areaName}</small>
        <h3>{product.title}</h3>
        <p>{product.validity.label}</p>
      </article>
      <label className="permit-test-date">
        Fiskedato
        <input
          type="date"
          value={fishingDate}
          onChange={(event) => {
            setFishingDate(event.target.value);
            setMessage("");
          }}
        />
      </label>
      {!seasonPermit ? (
        <div className="permit-payment-result error" role="alert">
          <b>Gyldig sesongkort mangler</b>
          <span>Registrer et sesongkort for {product.areaName} som dekker valgt fiskedøgn.</span>
        </div>
      ) : (
        <fieldset>
          <legend>Rapportstatus</legend>
          {Object.entries(permitReportingOutcomeLabels).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="reporting-outcome"
                checked={outcome === value}
                onChange={() => setOutcome(value as PermitReportingOutcome)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      )}
      <button className="primary" type="button" disabled={!seasonPermit} onClick={submit}>
        Registrer rapporteringsdøgn
      </button>
      {message && (
        <div className="permit-payment-result success" role="status" aria-live="polite">
          {message}
        </div>
      )}
    </section>
  );
}
