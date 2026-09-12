import { Icon } from "@/components/ui/icon";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { appContentRepository } from "@/data/repositories/app-content";
import { StatusEngineControl } from "@/features/status-engine/status-engine-control";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";

export function DemoControlPanel({
  scenarios,
  selected,
  isTestMode,
  selectStatus,
  startTest,
  useActualStatus,
  paymentOutcome,
  setPaymentOutcome,
}: {
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  isTestMode: boolean;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
  useActualStatus: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  setPaymentOutcome: (outcome: PrototypePaymentOutcome) => void;
}) {
  const { demoFeatures } = appContentRepository.getContent();
  const { t } = useLanguage();
  return (
    <aside className="prototype-note feature-panel">
      <span>{t("copy.demonstrasjonsmodus.bc46805")}</span>
      <h2>{t("copy.pr.v.statusmotoren.2bde28f")}</h2>
      <p className="demo-intro">
        {t("copy.velg.en.situasjon.valget.pavirker.statuskontroll.ce64541")}
      </p>
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
      <div className="feature-divider" />
      <span>{t("copy.funksjoner.i.prototypen.021b510")}</span>
      <ul>
        {demoFeatures.map((feature) => (
          <li key={feature}>
            <Icon name="check" size={16} />
            <span>{t(feature)}</span>
          </li>
        ))}
      </ul>
      <small>
        {t(
          `Prototypen bruker realistiske ${activeFishingRules.metadata.seasonYear}-regler. Kart, persondata, forhold og statistikk er demonstrasjonsdata.`,
        )}
      </small>
    </aside>
  );
}
