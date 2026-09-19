"use client";
import { DraftScope, DraftControls, useDraftState, useDraft } from "@/hooks/use-draft";
import { useState } from "react";
import {
  fishSpeciesOptions,
  catchOutcomeOptions,
  type CatchRecord,
  type CatchEdit,
  type CatchEditable,
} from "@/domain/catches/catch";
import { validateCatch } from "@/domain/catches/validate-catch";
import type { OperationResult } from "@/domain/shared/operation-result";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
function CatchCorrectionFormContent({
  report,
  onSave,
  onCancel,
}: {
  report: CatchRecord;
  onSave: (edit: CatchEdit) => OperationResult<void> | void | Promise<OperationResult<void> | void>;
  onCancel: () => void;
}) {
  const { language, t } = useLanguage();
  const draft = useDraft();
  const [values, setValues] = useDraftState<CatchEditable>("values", {
    species: report.species,
    result: report.result,
    length: report.length,
    weight: report.weight,
    comment: report.comment ?? "",
  });
  const [reason, setReason] = useDraftState("reason", "");
  const [error, setError] = useState("");
  const validation = validateCatch(values.species, values.result, values.length, values.weight);
  return (
    <form
      className="local-profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!validation.detailsValid || reason.trim().length < 5) return;
        const result = await onSave({ values, reason });
        if (result && !result.ok) setError(t(result.error));
        else {
          await draft?.complete();
          onCancel();
        }
      }}
    >
      <DraftControls />
      <h3>{selectLocalized(language, "Rett fangsten", "Correct catch")}</h3>
      <label>
        {t("copy.art.308e17d")}
        <select
          value={values.species}
          onChange={(e) =>
            setValues({ ...values, species: e.target.value as CatchEditable["species"] })
          }
        >
          {fishSpeciesOptions.map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {selectLocalized(language, "Resultat", "Outcome")}
        <select
          value={values.result}
          onChange={(e) =>
            setValues({ ...values, result: e.target.value as CatchEditable["result"] })
          }
        >
          {catchOutcomeOptions.map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {selectLocalized(language, "Lengde (cm)", "Length (cm)")}
        <input
          type="number"
          min="0.1"
          step="any"
          required
          value={values.length || ""}
          onChange={(e) => setValues({ ...values, length: Number(e.target.value) })}
        />
      </label>
      <label>
        {selectLocalized(language, "Vekt (kg)", "Weight (kg)")}
        <input
          type="number"
          min="0.01"
          step="any"
          required
          value={values.weight || ""}
          onChange={(e) => setValues({ ...values, weight: Number(e.target.value) })}
        />
      </label>
      <label>
        {t("copy.kommentar.19c85a8")}
        <textarea
          maxLength={300}
          value={values.comment}
          onChange={(e) => setValues({ ...values, comment: e.target.value })}
        />
      </label>
      {validation.blocked && <p role="alert">{t(validation.ruleText)}</p>}
      <label>
        {selectLocalized(
          language,
          "Hvorfor retter du fangsten?",
          "Why are you correcting the catch?",
        )}
        <textarea
          minLength={5}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <button
        className="primary"
        type="submit"
        disabled={!validation.detailsValid || reason.trim().length < 5}
      >
        {selectLocalized(language, "Lagre rettelse", "Save correction")}
      </button>
      <button className="secondary" type="button" onClick={onCancel}>
        {t("copy.avbryt.d10c9f7")}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export function CatchCorrectionForm(props: Parameters<typeof CatchCorrectionFormContent>[0]) {
  return (
    <DraftScope id={`catch-correction:${props.report.id}`}>
      <CatchCorrectionFormContent {...props} />
    </DraftScope>
  );
}
