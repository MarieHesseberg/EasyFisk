"use client";

import { createPermitJourney } from "@/features/fishing-permits/permit-journey";
import { Fragment, useState } from "react";
import { CatchReportModal } from "@/features/catch-report/catch-report-modal";
import { useEasyFiskController } from "@/application/easy-fisk/use-easy-fisk-controller";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ScrollIndicator } from "@/components/layout/scroll-indicator";
import { DemoControlPanel } from "@/components/layout/demo-control-panel";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
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
import { useLanguage } from "@/components/localization/language-provider";

export function EasyFiskApp() {
  const { t } = useLanguage();
  const [navigationRevision, setNavigationRevision] = useState(0);
  const [catchReportOpen, setCatchReportOpen] = useState(false);
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
    sessionSubzone,
    startTime,
    statsMineRequested,
    toast,
    zone,
  } = state;
  const [permitJourney, setPermitJourney] = useState(() => createPermitJourney(zone));
  function openPermitShop() {
    setPermitJourney((previous) =>
      previous.selectedZone === zone
        ? previous
        : {
            ...previous,
            selectedZone: zone,
            selectedArea: "all",
            selectedProductId: null,
            isProductActionOpen: false,
          },
    );
    actions.closeDetail();
    actions.closeFlow();
    actions.navigate("permits");
  }
  const demoStatuses = fishingContentRepository.getDemoScenarios();
  const zones = fishingContentRepository.getZones();
  const selectedDemo = findDemoStatus(demoStatus, demoStatuses);
  const quotaStatus = getFishingStartQuotaStatus(catches);
  const displayedQuotaStatus = getDisplayedQuotaStatus(quotaStatus, demoStatus, isStatusTestMode);
  const contextZone = active ? sessionZone : zone;
  const actualDocumentReadiness = getDocumentReadiness(documents, documentCheckTime, contextZone);
  const validPermitZoneIds = getValidPermitZoneIds(documents, documentCheckTime);
  const effectiveStatus = resolveStatusEngine(
    actualDocumentReadiness,
    selectedDemo,
    isStatusTestMode,
    quotaStatus,
  );
  return (
    <main className="prototype-shell">
      <div className="phone-app">
        <Fragment key={navigationRevision}>
          {screen === "home" && (
            <HomeScreen
              onStart={actions.openSessionFlow}
              onRegisterCatch={() => setCatchReportOpen(true)}
              onHistory={actions.openMyHistory}
              catches={catches}
              onRules={() => actions.navigate("rules")}
              onDocument={actions.openDetail}
              onPastSession={actions.openPastSession}
              onBuyPermit={openPermitShop}
              zoneName={findZoneName(contextZone, zones, active ? sessionSubzone : undefined)}
              active={active}
              elapsed={elapsed}
              startTime={startTime}
              demoStatus={effectiveStatus.status}
              scenario={effectiveStatus.scenario}
              documentReadiness={effectiveStatus.readiness}
              isStatusTestMode={isStatusTestMode}
              quotaStatus={displayedQuotaStatus}
            />
          )}{" "}
          {screen === "map" && (
            <MapScreen selected={zone} setSelected={actions.setZone} onBuyPermit={openPermitShop} />
          )}{" "}
          {screen === "permits" && (
            <PermitShopScreen
              journey={permitJourney}
              setJourney={setPermitJourney}
              onZoneChange={actions.setZone}
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
              selectedZone={contextZone}
              documents={documents}
              now={documentCheckTime}
              onRegisterPermit={openPermitShop}
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
              activeZone={findZoneName(sessionZone, zones, sessionSubzone)}
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
              openPermitShop={openPermitShop}
              paymentOutcome={paymentOutcome}
              setPaymentOutcome={actions.setPaymentOutcome}
              testDemoStatus={() => {
                if (!actions.startStatusTest()) return;
                actions.navigate("home");
              }}
            />
          )}
        </Fragment>
        <BottomNavigation
          activeScreen={screen}
          navigate={(destination) => {
            setCatchReportOpen(false);
            actions.dismissCatchFlow();
            setNavigationRevision((revision) => revision + 1);
            if (destination === "permits") openPermitShop();
            else actions.navigate(destination);
          }}
        />
        {toast && (
          <div className="toast" role="status" aria-live="polite" aria-atomic="true">
            <Icon name="check" size={18} />
            {t(toast)}
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
              openPermitShop();
            }}
            sessionZone={sessionZone}
            sessionSubzone={sessionSubzone}
            catchCount={catches.filter((record) => record.sessionStart === startTime).length}
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
        {(catchReportOpen || (finishAfterCatch && screen === "home")) && (
          <CatchReportModal
            activeZone={findZoneName(sessionZone, zones, sessionSubzone)}
            catches={catches}
            finishAfterCatch={finishAfterCatch}
            onCatch={actions.addCatch}
            onCatchFlowComplete={actions.completeCatchFlow}
            onClose={() => {
              setCatchReportOpen(false);
              if (finishAfterCatch) {
                if (active) actions.cancelCatchBeforeFinish();
                else actions.completeCatchFlow();
              }
            }}
            requestedCatchTime={finishAfterCatch ? requestedCatchTime : 0}
            startTime={startTime}
          />
        )}
        {globalDetail && (
          <ProfileDetailDialog
            destination={globalDetail}
            close={actions.closeDetail}
            testReadiness={isStatusTestMode ? effectiveStatus.readiness : undefined}
            openPermitShop={openPermitShop}
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
