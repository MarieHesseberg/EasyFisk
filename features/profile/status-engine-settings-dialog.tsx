import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { StatusEngineControl } from "@/features/status-engine/status-engine-control";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";

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
        ‹ Tilbake
      </button>
      <small>PROTOTYPEINNSTILLING</small>
      <h2 id="status-engine-title">Statusmotor</h2>
      <p className="detail-lead">
        Velg situasjonen prototypen skal bruke. Statusen påvirker kontrollene på hjemskjermen og om
        en fiskeøkt kan startes. Valget overstyrer lokalt registrerte dokumenter mens situasjonen
        testes; dokumentene slettes ikke.
      </p>
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
