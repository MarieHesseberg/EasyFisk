import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { StatusEngineControl } from "@/features/status-engine/status-engine-control";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";

export function StatusEngineSettingsDialog({
  close,
  scenarios,
  selected,
  isTestMode,
  selectStatus,
  startTest,
  useActualStatus,
  paymentOutcome,
  setPaymentOutcome,
}: {
  close: () => void;
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  isTestMode: boolean;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
  useActualStatus: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  setPaymentOutcome: (outcome: PrototypePaymentOutcome) => void;
}) {
  const { t } = useLanguage();
  const dialogRef = useDialogAccessibility(close);

  return (
    <div
      ref={dialogRef}
      className="detail-page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-engine-title"
      tabIndex={-1}
    >
      <button className="back" onClick={close}>
        ‹ {t("copy.tilbake.4fb8dc1")}
      </button>
      <small>{t("copy.prototypeinnstilling.8444e8e")}</small>
      <h2 id="status-engine-title">{t("copy.statusmotor.9cef87d")}</h2>
      <p className="detail-lead">{t("prototype.statusScenarioExplanation")}</p>
      <section className="status-engine-settings">
        <StatusEngineControl
          id="mobile-demo-status"
          scenarios={scenarios}
          selected={selected}
          isTestMode={isTestMode}
          selectStatus={selectStatus}
          startTest={startTest}
          useActualStatus={useActualStatus}
          paymentOutcome={paymentOutcome}
          setPaymentOutcome={setPaymentOutcome}
        />
      </section>
    </div>
  );
}
