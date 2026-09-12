import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { HomeSessionCard } from "@/features/home/components/home-session-card";
import { RequirementsOverview } from "@/features/home/components/requirements-overview";
import { HomeShortcuts } from "@/features/home/components/home-shortcuts";
import { appContentRepository } from "@/data/repositories/app-content";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { DetailDestination } from "@/domain/navigation/navigation";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";
import { useLanguage } from "@/components/localization/language-provider";
export function HomeScreen({
  onStart,
  onRules,
  onFeedback,
  onControlCard,
  onDocument,
  onPastSession,
  onMapShortcut,
  onBuyPermit,
  active,
  elapsed,
  startTime,
  demoStatus,
  scenario,
  documentReadiness,
  isStatusTestMode,
  salmonKilled,
  quotaStatus,
}: {
  onStart: () => void;
  onRules: () => void;
  onFeedback: () => void;
  onControlCard: () => void;
  onDocument: (destination: DetailDestination) => void;
  onPastSession: () => void;
  onMapShortcut: () => void;
  onBuyPermit: () => void;
  active: boolean;
  elapsed: number;
  startTime: number | null;
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  salmonKilled: number;
  quotaStatus: FishingStartQuotaStatus;
}) {
  const { riverStatus } = appContentRepository.getContent();
  const { catchSize, metadata, quota } = activeFishingRules;
  const { language, t } = useLanguage();
  return (
    <div className="screen">
      <ScreenHeader title={t("copy.din.fiskeoversikt.68cb7f9")} />
      <HomeSessionCard
        active={active}
        elapsed={elapsed}
        startTime={startTime}
        scenario={scenario}
        isTestMode={isStatusTestMode}
        zone={riverStatus.currentZoneShortName}
        openFlow={onStart}
      />
      <button className="home-past-session-button" onClick={onPastSession}>
        <Icon name="clock" size={20} />
        <span>
          <b>{t("copy.registrer.tidligere.fisketur.4812b12")}</b>
          <small>{t("copy.etterregistrer.en.tur.uten.a.starte.en.ny.fiske..be70a08")}</small>
        </span>
        <Icon name="chevron" size={18} />
      </button>
      <RequirementsOverview
        demoStatus={demoStatus}
        documentReadiness={documentReadiness}
        isStatusTestMode={isStatusTestMode}
        scenario={scenario}
        openDocument={onDocument}
        remainingSalmon={Math.max(0, quota.killedSalmonPerSeason - salmonKilled)}
        seasonQuota={quota.killedSalmonPerSeason}
        quotaStatus={quotaStatus}
        openControlCard={onControlCard}
        openPermitShop={onBuyPermit}
      />
      <button className="home-feedback-card" onClick={onFeedback}>
        <span>
          <Icon name="bell" />
        </span>
        <div>
          <small>{t("copy.tilbakemelding.og.observasjon.874b945")}</small>
          <b>{t("copy.meld.fra.til.elveeigarlaget.c011953")}</b>
          <p>{t("copy.rapporter.feil.fors.pling.syk.fisk.eller.mistenk.f156eef")}</p>
        </div>
        <Icon name="chevron" size={18} />
      </button>
      <HomeShortcuts openMap={onMapShortcut} openRules={onRules} />
      <section className="info-card">
        <small>
          {selectLocalized(language, "REGLER OPPDATERT", "RULES UPDATED")}{" "}
          {metadata.versionLabel.toUpperCase()}
        </small>
        <h3>
          {quota.killedSalmonPerDay}{" "}
          {selectLocalized(language, "laks per fiskerdøgn", "salmon per fishing day")}
        </h3>
        <p>
          {selectLocalized(
            language,
            `Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn. Minstemålet er ${catchSize.minimumCm} cm. Én av sesongens ${quota.killedSalmonPerSeason} avlivede laks kan være opptil ${catchSize.largeSalmonMaximumCm} cm. De øvrige må være under ${catchSize.regularSalmonMaximumCm} cm.`,
            `Once one salmon has been harvested, all fishing must stop until the next fishing day. The minimum size is ${catchSize.minimumCm} cm. One of the season's ${quota.killedSalmonPerSeason} harvested salmon may be up to ${catchSize.largeSalmonMaximumCm} cm. The others must be under ${catchSize.regularSalmonMaximumCm} cm.`,
          )}
        </p>
        <button onClick={onRules}>
          {t("copy.se.komplett.regelkontroll.47003a2")}
          <Icon name="chevron" size={16} />
        </button>
      </section>
    </div>
  );
}
