import { catchBelongsToSession } from "@/domain/sessions/catch-belongs-to-session";
import { useEffect, useRef } from "react";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { HomePermitHero } from "./components/home-permit-hero";
import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { HomeActionRow } from "./components/home-action-row";
import { HomePreparation } from "./components/home-preparation";
import { HomeActiveTrip } from "./components/home-active-trip";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { DetailDestination } from "@/domain/navigation/navigation";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";
import type { CatchRecord } from "@/domain/catches/catch";
import { useLanguage } from "@/components/localization/language-provider";
import { localizeText } from "@/domain/localization/localized-text";

const documentStatuses: DemoStatus[] = [
  "allMissing",
  "noPermit",
  "wrongZone",
  "expiredDisinfection",
  "otherRiver",
  "noFee",
];

export function HomeScreen({
  zoneName,
  onStart,
  onRegisterCatch,
  onHistory,
  catches,
  onRules,
  onDocument,
  onPastSession,
  onBuyPermit,
  active,
  elapsed,
  startTime,
  sessionId,
  demoStatus,
  scenario,
  documentReadiness,
  isStatusTestMode,
  quotaStatus,
  permit,
}: {
  zoneName: string;
  onStart: () => void;
  onRegisterCatch: () => void;
  onHistory: () => void;
  catches: CatchRecord[];
  onRules: () => void;
  onDocument: (destination: DetailDestination) => void;
  onPastSession: () => void;
  onBuyPermit: () => void;
  active: boolean;
  elapsed: number;
  startTime: number | null;
  sessionId?: string;
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  quotaStatus: FishingStartQuotaStatus;
  permit?: FishingDocument;
}) {
  const { language, t } = useLanguage();
  const screenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // A started or completed trip has new primary actions at the top.
    screenRef.current?.scrollTo({ top: 0 });
  }, [active]);
  const preparing = !documentReadiness.complete && documentStatuses.includes(demoStatus);
  const sessionCatchCount = catches.filter(
    (record) =>
      startTime !== null &&
      catchBelongsToSession(record, { id: sessionId ?? "", start: startTime }),
  ).length;
  const dailyReached = quotaStatus.dailyReached;
  const showActiveWarning = active && (dailyReached || scenario.level !== "ok");

  const ready = !preparing && scenario.level === "ok";

  return (
    <div ref={screenRef} className="screen home-screen">
      <ScreenHeader title={t("copy.din.fiskeoversikt.68cb7f9")} />
      {active ? (
        <>
          <HomeActiveTrip
            zoneName={zoneName}
            elapsed={elapsed}
            startTime={startTime}
            onRegisterCatch={onRegisterCatch}
            onStop={onStart}
          />
          <HomeActionRow
            icon="ticket"
            title={selectLocalized(language, "Mine fiskekort", "My permits")}
            detail={selectLocalized(language, "Kort og dokumentasjon", "Permits and documentation")}
            onClick={() => onDocument("permits")}
          />
          <HomeActionRow
            icon="document"
            title={selectLocalized(language, "Regler for denne sonen", "Rules for this zone")}
            onClick={onRules}
          />
        </>
      ) : (
        <>
          <HomePermitHero
            permit={permit}
            previewZone={isStatusTestMode && documentReadiness.valid.permit ? zoneName : undefined}
            openPermits={() => onDocument("permits")}
          />
          <section className={preparing ? "home-preparation-actions" : "home-start-actions"}>
            {!preparing && (
              <>
                {!ready && (
                  <div className="home-journey-warning" role="status">
                    <b>{t(localizeText(scenario.title, language))}</b>
                    <p>{t(localizeText(scenario.detail, language))}</p>
                  </div>
                )}
                <button className="primary home-start-button" onClick={onStart}>
                  {ready
                    ? selectLocalized(language, "Start fiske", "Start fishing")
                    : scenario.level === "blocked"
                      ? t("content.46e6fa1c44cc")
                      : t("content.1f04327c989d")}
                </button>
              </>
            )}
            <button
              className={preparing ? "primary home-buy-button" : "secondary home-buy-button"}
              onClick={onBuyPermit}
            >
              {t("copy.kj.p.fiskekort.d32ea04")}
            </button>
            {preparing ? (
              <HomePreparation documentReadiness={documentReadiness} onDocument={onDocument} />
            ) : (
              documentReadiness.complete && (
                <HomeActionRow
                  icon="shield"
                  tone="sage"
                  title={selectLocalized(
                    language,
                    "Dokumentene er på plass",
                    "Your documents are ready",
                  )}
                  detail={selectLocalized(
                    language,
                    "Se fiskekort, desinfisering og avgift",
                    "View permits, disinfection and fee",
                  )}
                  onClick={() => onDocument("control-card")}
                />
              )
            )}
          </section>
        </>
      )}

      {showActiveWarning && (
        <section className="home-journey-warning" role="status">
          <b>
            {dailyReached
              ? selectLocalized(
                  language,
                  "Døgnkvoten er nådd – avslutt fisket",
                  "Daily quota reached – finish fishing",
                )
              : t(localizeText(scenario.title, language))}
          </b>
          <button onClick={onRules}>
            {selectLocalized(language, "Se regler og status", "View rules and status")}
          </button>
        </section>
      )}

      {active && sessionCatchCount > 0 && (
        <button className="home-trip-summary" onClick={onHistory}>
          <Icon name="fish" size={19} />
          <span>
            {selectLocalized(
              language,
              `${sessionCatchCount} fangst${sessionCatchCount === 1 ? "" : "er"} registrert på turen`,
              `${sessionCatchCount} ${sessionCatchCount === 1 ? "catch" : "catches"} recorded on this trip`,
            )}
          </span>
          <Icon name="chevron" size={16} />
        </button>
      )}

      {!active && (
        <HomeActionRow
          className="home-past-session-button"
          icon="hook"
          tone="gray"
          title={selectLocalized(
            language,
            "Registrer tidligere fisketur",
            "Register a previous fishing trip",
          )}
          onClick={onPastSession}
        />
      )}
      <button className="home-feedback-card" onClick={() => onDocument("feedback")}>
        <span className="home-shortcut-icon">
          <Icon name="people" size={25} />
        </span>
        <div>
          <b>{t("copy.meld.fra.til.elveeigarlaget.c011953")}</b>
        </div>
        <Icon name="chevron" size={18} />
      </button>
    </div>
  );
}
