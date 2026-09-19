import { Icon } from "@/components/ui/icon";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { StatusEngineControl } from "@/features/status-engine/status-engine-control";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";

export function DemoControlPanel({
  blocked = false,
  openTestGuide,
  scenarios,
  selected,
  isTestMode,
  selectStatus,
  startTest,
  useActualStatus,
  paymentOutcome,
  setPaymentOutcome,
}: {
  blocked?: boolean;
  openTestGuide?: () => void;
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
  return (
    <aside
      className="prototype-note tester-panel visual-refresh"
      inert={blocked}
      aria-label={t("testGuide.panelBadge")}
    >
      <header className="tester-panel-header">
        <span className="tester-panel-badge">{t("testGuide.panelBadge")}</span>
        <h2>{t("testGuide.panelTitle")}</h2>
        <p>{t("testGuide.panelIntro")}</p>
        {openTestGuide && (
          <button className="test-guide-reopen" onClick={openTestGuide}>
            <Icon name="book" size={20} />
            <span>{t("testGuide.open")}</span>
            <Icon name="chevron" size={18} />
          </button>
        )}
      </header>
      <section className="tester-panel-card">
        <h3>
          <Icon name="stats" />
          {t("copy.statusmotor.9cef87d")}
        </h3>
        <StatusEngineControl
          id="desktop-demo-status"
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
      <section className="tester-panel-card">
        <h3>{t("testGuide.panelTasks")}</h3>
        <ul>
          {["testGuide.panelTaskBuy", "testGuide.panelTaskTrip", "testGuide.panelTaskExplore"].map(
            (key) => (
              <li key={key}>
                <Icon name="check" size={18} />
                <span>{t(key)}</span>
              </li>
            ),
          )}
        </ul>
        <p>{t("testGuide.panelFeedback")}</p>
      </section>
      <p className="tester-panel-footnote">{t("testGuide.panelLimits")}</p>
    </aside>
  );
}
