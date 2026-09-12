import { selectLocalized } from "@/locales";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";
import { localizeText } from "@/domain/localization/localized-text";
export function StatusEngineControl({
  id,
  scenarios,
  selected,
  isTestMode,
  selectStatus,
  startTest,
  useActualStatus,
  paymentOutcome,
  setPaymentOutcome,
}: {
  id: string;
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  isTestMode: boolean;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
  useActualStatus: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  setPaymentOutcome: (outcome: PrototypePaymentOutcome) => void;
}) {
  const { language, t } = useLanguage();
  return (
    <>
      <label className="demo-select-label" htmlFor={id}>
        {t("copy.situasjon.526cb92")}
      </label>
      <select
        id={id}
        className="demo-select"
        value={selected.id}
        onChange={(event) => selectStatus(event.target.value as DemoStatus)}
      >
        {scenarios.map((scenario) => (
          <option value={scenario.id} key={scenario.id}>
            {t(localizeText(scenario.label, language))}
          </option>
        ))}
      </select>
      <div className={`demo-result ${selected.level}`} role="status" aria-live="polite">
        <small>{t(isTestMode ? "TESTMODUS ER AKTIV" : "NORMALMODUS ER AKTIV")}</small>
        <b>{getStatusResult(selected, language)}</b>
        <span>{t(localizeText(selected.detail, language))}</span>
      </div>
      <button className="demo-start" onClick={startTest}>
        {t(isTestMode ? "Bruk valgt testsituasjon" : "Aktiver og test valgt situasjon")}
      </button>
      {isTestMode && (
        <button className="secondary" onClick={useActualStatus}>
          {t("copy.avslutt.testmodus.bruk.registrerte.dokumenter.c2e2f6b")}
        </button>
      )}
      <div className="feature-divider" />
      <label className="demo-select-label" htmlFor={`${id}-payment`}>
        {t("copy.resultat.ved.neste.testbetaling.624acf3")}
      </label>
      <select
        id={`${id}-payment`}
        className="demo-select"
        value={paymentOutcome}
        onChange={(event) => setPaymentOutcome(event.target.value as PrototypePaymentOutcome)}
      >
        <option value="approved">{t("copy.betaling.godkjennes.4bab448")}</option>
        <option value="cancelled">{t("copy.betaling.avbrytes.ba0b329")}</option>
        <option value="failed">{t("copy.betaling.feiler.f1a3c37")}</option>
      </select>
      <small>{t("copy.dette.er.en.intern.prototypeinnstilling.og.vises.310b3f3")}</small>
    </>
  );
}
function getStatusResult(scenario: DemoScenario, language: "no" | "en") {
  if (scenario.level === "blocked")
    return selectLocalized(language, "Blokkerer oppstart", "Blocks fishing start");
  if (scenario.level === "warning")
    return selectLocalized(language, "Krever vurdering", "Requires assessment");
  return selectLocalized(language, "Oppstart tillatt", "Fishing start permitted");
}
