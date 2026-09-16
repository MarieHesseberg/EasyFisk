import { useEffect, useRef } from "react";
import { selectLocalized } from "@/locales";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { HomeSessionCard } from "@/features/home/components/home-session-card";
import { ActiveSessionCard } from "@/features/fishing-session/components/active-session-card";
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
  demoStatus,
  scenario,
  documentReadiness,
  isStatusTestMode,
  quotaStatus,
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
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  quotaStatus: FishingStartQuotaStatus;
}) {
  const { language, t } = useLanguage();
  const screenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // A started or completed trip has new primary actions at the top.
    screenRef.current?.scrollTo({ top: 0 });
  }, [active]);
  const preparing = !documentReadiness.complete && documentStatuses.includes(demoStatus);
  const sessionCatchCount = catches.filter((record) => record.sessionStart === startTime).length;
  const dailyReached = quotaStatus.dailyReached;
  const showActiveWarning = active && (dailyReached || scenario.level !== "ok");

  return (
    <div ref={screenRef} className="screen home-screen">
      <ScreenHeader title={t("copy.din.fiskeoversikt.68cb7f9")} />
      {active ? (
        <ActiveSessionCard
          activeZone={zoneName}
          elapsed={elapsed}
          startTime={startTime}
          registerCatch={onRegisterCatch}
          showRules={onRules}
          stop={onStart}
          compact
        />
      ) : (
        <HomeSessionCard
          active={false}
          elapsed={elapsed}
          startTime={startTime}
          scenario={scenario}
          isTestMode={isStatusTestMode}
          zone={zoneName}
          preparing={preparing}
          openFlow={onStart}
        >
          {preparing ? (
            <div className="home-preparation-actions">
              {(
                [
                  {
                    kind: "permit",
                    label: t("copy.kj.p.fiskekort.d32ea04"),
                    saved: selectLocalized(
                      language,
                      "Fiskekort registrert",
                      "Fishing permit registered",
                    ),
                    open: documentReadiness.valid.permit
                      ? () => onDocument("permits")
                      : onBuyPermit,
                  },
                  {
                    kind: "disinfection",
                    label: selectLocalized(
                      language,
                      "Registrer desinfisering",
                      "Register disinfection",
                    ),
                    saved: selectLocalized(
                      language,
                      "Desinfisering registrert",
                      "Disinfection registered",
                    ),
                    open: () => onDocument("disinfection"),
                  },
                  {
                    kind: "fee",
                    label: selectLocalized(
                      language,
                      "Registrer statlig fiskeravgift",
                      "Register national fishing fee",
                    ),
                    saved: selectLocalized(
                      language,
                      "Statlig fiskeravgift registrert",
                      "National fishing fee registered",
                    ),
                    open: () => onDocument("fee"),
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.kind}
                  className={`start-button preparation-${item.kind}${documentReadiness.valid[item.kind] ? " document-ready" : ""}`}
                  onClick={item.open}
                >
                  <Icon
                    name={documentReadiness.valid[item.kind] ? "check" : "activity"}
                    size={20}
                  />
                  <span>{documentReadiness.valid[item.kind] ? item.saved : item.label}</span>
                </button>
              ))}
            </div>
          ) : undefined}
        </HomeSessionCard>
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

      {active && (
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

      {!active && documentReadiness.complete && (
        <p className="home-document-status">
          <Icon name="check" size={16} />
          {selectLocalized(
            language,
            "Dokumentkrav registrert i appen",
            "Document requirements recorded in the app",
          )}
        </p>
      )}

      <button className="home-past-session-button" onClick={onPastSession}>
        <span className="home-shortcut-icon">
          <Icon name="clock" size={22} />
        </span>
        <span className="home-shortcut-copy">
          <b>{selectLocalized(language, "Glemt å trykke start?", "Forgot to press start?")}</b>
          <small>
            {selectLocalized(
              language,
              "Registrer en tidligere fisketur",
              "Register a previous fishing trip",
            )}
          </small>
        </span>
        <Icon name="chevron" size={20} />
      </button>
      <button className="home-feedback-card" onClick={() => onDocument("feedback")}>
        <span>
          <Icon name="bell" />
        </span>
        <div>
          <b>{t("copy.meld.fra.til.elveeigarlaget.c011953")}</b>
          <p>{t("copy.rapporter.feil.fors.pling.syk.fisk.eller.mistenk.f156eef")}</p>
        </div>
        <Icon name="chevron" size={18} />
      </button>
    </div>
  );
}
