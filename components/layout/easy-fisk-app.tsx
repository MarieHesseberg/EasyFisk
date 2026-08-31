"use client";

import { useEasyFiskController } from "@/application/easy-fisk/use-easy-fisk-controller";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ScrollIndicator } from "@/components/layout/scroll-indicator";
import { DemoControlPanel } from "@/components/layout/demo-control-panel";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { calculatePersonalStatistics } from "@/domain/statistics/calculate-personal-statistics";
import { findZoneName } from "@/domain/zones/find-zone-name";
import { FishingFlow } from "@/features/fishing-session/fishing-flow";
import { HomeScreen } from "@/features/home/home-screen";
import { MapScreen } from "@/features/map/map-screen";
import { PermitShopScreen } from "@/features/fishing-permits/permit-shop-screen";
import { ProfileDetailDialog } from "@/features/profile/profile-detail-dialog";
import { ProfileScreen } from "@/features/profile/profile-screen";
import { RulesScreen } from "@/features/rules/rules-screen";
import { StatisticsScreen } from "@/features/statistics/statistics-screen";
import { useDocuments } from "@/features/documents/use-documents";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import { resolveStatusEngine } from "@/domain/fishing-rules/resolve-status-engine";
import {
  getDisplayedQuotaStatus,
  getFishingStartQuotaStatus,
} from "@/domain/quotas/get-fishing-start-quota-status";
import { getValidPermitZoneIds } from "@/domain/documents/get-permit-zones";
import { useCurrentTime } from "@/hooks/use-current-time";

export function EasyFiskApp() {
  const { state, actions } = useEasyFiskController();
  const { documents } = useDocuments();
  const documentCheckTime = useCurrentTime();
  const {
    active,
    catches,
    demoStatus,
    elapsed,
    finishAfterCatch,
    flow,
    globalDetail,
    isStatusTestMode,
    lastSession,
    pastSessionRequested,
    paymentOutcome,
    requestedCatchTime,
    screen,
    sessions,
    sessionZone,
    startTime,
    statsMineRequested,
    toast,
    zone,
  } = state;
  const demoStatuses = fishingContentRepository.getDemoScenarios();
  const zones = fishingContentRepository.getZones();
  const selectedDemo = findDemoStatus(demoStatus, demoStatuses);
  const quotaStatus = getFishingStartQuotaStatus(catches);
  const displayedQuotaStatus = getDisplayedQuotaStatus(quotaStatus, demoStatus, isStatusTestMode);
  const actualDocumentReadiness = getDocumentReadiness(documents, documentCheckTime, zone);
  const validPermitZoneIds = getValidPermitZoneIds(documents, documentCheckTime);
  const effectiveStatus = resolveStatusEngine(
    actualDocumentReadiness,
    selectedDemo,
    isStatusTestMode,
    quotaStatus,
  );
  const personalStatistics = calculatePersonalStatistics(catches, sessions);
  return (
    <main className="prototype-shell">
      <div className="phone-app">
        {screen === "home" && (
          <HomeScreen
            onStart={actions.openSessionFlow}
            onRules={() => actions.navigate("rules")}
            onFeedback={() => actions.openDetail("feedback")}
            onControlCard={() => actions.openDetail("control-card")}
            onDocument={actions.openDetail}
            onPastSession={actions.openPastSession}
            onMapShortcut={() => actions.navigate("map")}
            onBuyPermit={() => actions.openDetail("permit-shop")}
            active={active}
            elapsed={elapsed}
            startTime={startTime}
            demoStatus={effectiveStatus.status}
            scenario={effectiveStatus.scenario}
            documentReadiness={effectiveStatus.readiness}
            isStatusTestMode={isStatusTestMode}
            salmonKilled={personalStatistics.killedSalmonQuota.usedThisSeason}
            quotaStatus={displayedQuotaStatus}
          />
        )}{" "}
        {screen === "map" && (
          <MapScreen
            selected={zone}
            setSelected={actions.setZone}
            onUseZone={actions.useZone}
            onBuyPermit={() => actions.openDetail("permit-shop")}
          />
        )}{" "}
        {screen === "permits" && (
          <PermitShopScreen
            initialZone={zone}
            paymentOutcome={paymentOutcome}
            onPermitPurchased={(purchasedZone) => {
              actions.setZone(purchasedZone);
            }}
            onOpenPermits={() => actions.openDetail("permits")}
            onGoHome={() => actions.navigate("home")}
            onRegisterFee={() => actions.openDetail("fee")}
            onRegisterDisinfection={() => actions.openDetail("disinfection")}
          />
        )}{" "}
        {screen === "rules" && (
          <RulesScreen
            demoStatus={effectiveStatus.status}
            onRegisterPermit={() => actions.openDetail("permits")}
          />
        )}{" "}
        {screen === "stats" && (
          <StatisticsScreen
            active={active}
            onStart={() => actions.setFlow("start")}
            onStop={() => actions.setFlow("stop")}
            onAddPast={actions.addPastSession}
            onCatch={actions.addCatch}
            onCorrectCatch={actions.correctCatch}
            onShowRules={() => actions.navigate("rules")}
            openMine={statsMineRequested}
            openPastSession={pastSessionRequested}
            onCatchFlowComplete={actions.completeCatchFlow}
            finishAfterCatch={finishAfterCatch}
            catches={catches}
            activeZone={findZoneName(sessionZone, zones)}
            requestedCatchTime={requestedCatchTime}
            elapsed={elapsed}
            startTime={startTime}
            sessions={sessions}
          />
        )}{" "}
        {screen === "more" && (
          <ProfileScreen
            demoStatus={demoStatus}
            documentReadiness={effectiveStatus.readiness}
            isStatusTestMode={isStatusTestMode}
            selectDemoStatus={actions.selectDemoStatus}
            useActualStatus={actions.useActualStatus}
            openStatistics={() => actions.navigate("stats")}
            openPermitShop={() => actions.openDetail("permit-shop")}
            paymentOutcome={paymentOutcome}
            setPaymentOutcome={actions.setPaymentOutcome}
            testDemoStatus={() => {
              if (!actions.startStatusTest()) return;
              actions.navigate("home");
            }}
          />
        )}
        <BottomNavigation activeScreen={screen} navigate={actions.navigate} />
        {toast && (
          <div className="toast" role="status" aria-live="polite" aria-atomic="true">
            <Icon name="check" size={18} />
            {toast}
          </div>
        )}
        {flow && (
          <FishingFlow
            mode={flow}
            finish={actions.finishSessionFlow}
            cancel={actions.closeFlow}
            demoStatus={effectiveStatus.status}
            scenario={effectiveStatus.scenario}
            documentReadiness={effectiveStatus.readiness}
            quotaStatus={displayedQuotaStatus}
            isStatusTestMode={isStatusTestMode}
            startTime={startTime}
            elapsed={elapsed}
            lastSession={lastSession}
            resolveBlock={() => actions.resolveBlockedStatus(effectiveStatus.status)}
            openPermitShop={() => {
              actions.closeFlow();
              actions.openDetail("permit-shop");
            }}
            sessionZone={sessionZone}
            initialZone={zone}
            permittedZoneIds={
              isStatusTestMode &&
              effectiveStatus.readiness.valid.permit &&
              !validPermitZoneIds.length
                ? [zone]
                : validPermitZoneIds
            }
          />
        )}
        {globalDetail && (
          <ProfileDetailDialog
            destination={globalDetail}
            close={actions.closeDetail}
            testReadiness={isStatusTestMode ? effectiveStatus.readiness : undefined}
            openPermitShop={() => actions.openDetail("permit-shop")}
            selectedZone={zone}
            onPermitPurchased={actions.setZone}
            onOpenPermits={() => actions.openDetail("permits")}
            onGoHome={() => {
              actions.closeDetail();
              actions.navigate("home");
            }}
            paymentOutcome={paymentOutcome}
          />
        )}
        <ScrollIndicator />
      </div>
      <DemoControlPanel
        scenarios={demoStatuses}
        selected={selectedDemo}
        isTestMode={isStatusTestMode}
        selectStatus={actions.selectDemoStatus}
        useActualStatus={actions.useActualStatus}
        paymentOutcome={paymentOutcome}
        setPaymentOutcome={actions.setPaymentOutcome}
        startTest={() => {
          if (!actions.startStatusTest()) return;
          actions.navigate("home");
        }}
      />
    </main>
  );
}
