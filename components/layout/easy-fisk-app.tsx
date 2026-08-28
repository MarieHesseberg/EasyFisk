"use client";

import { useEasyFiskController } from "@/application/easy-fisk/use-easy-fisk-controller";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { DemoControlPanel } from "@/components/layout/demo-control-panel";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { countKilledSalmon } from "@/domain/quotas/count-killed-salmon";
import { findZoneName } from "@/domain/zones/find-zone-name";
import { FishingFlow } from "@/features/fishing-session/fishing-flow";
import { HomeScreen } from "@/features/home/home-screen";
import { MapScreen } from "@/features/map/map-screen";
import { ProfileDetailDialog } from "@/features/profile/profile-detail-dialog";
import { ProfileScreen } from "@/features/profile/profile-screen";
import { RulesScreen } from "@/features/rules/rules-screen";
import { StatisticsScreen } from "@/features/statistics/statistics-screen";

export function EasyFiskApp() {
  const { state, actions } = useEasyFiskController();
  const {
    active,
    catches,
    demoStatus,
    elapsed,
    finishAfterCatch,
    flow,
    globalDetail,
    lastSession,
    requestedCatchTime,
    screen,
    sessionZone,
    startTime,
    statsMineRequested,
    toast,
    zone,
  } = state;
  const demoStatuses = fishingContentRepository.getDemoScenarios();
  const zones = fishingContentRepository.getZones();
  const selectedDemo = findDemoStatus(demoStatus, demoStatuses);
  return (
    <main className="prototype-shell">
      <div className="phone-app">
        {screen === "home" && (
          <HomeScreen
            onStart={actions.openSessionFlow}
            onRules={() => actions.navigate("rules")}
            onFeedback={() => actions.openDetail("feedback")}
            onControlCard={() => actions.openDetail("control-card")}
            onCatchShortcut={actions.openCatchHistory}
            onMapShortcut={() => actions.navigate("map")}
            active={active}
            elapsed={elapsed}
            startTime={startTime}
            demoStatus={demoStatus}
            salmonKilled={countKilledSalmon(catches)}
          />
        )}{" "}
        {screen === "map" && (
          <MapScreen selected={zone} setSelected={actions.setZone} onUseZone={actions.useZone} />
        )}{" "}
        {screen === "rules" && (
          <RulesScreen
            demoStatus={demoStatus}
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
            onCatchFlowComplete={actions.completeCatchFlow}
            finishAfterCatch={finishAfterCatch}
            catches={catches}
            activeZone={findZoneName(sessionZone, zones)}
            requestedCatchTime={requestedCatchTime}
            elapsed={elapsed}
            startTime={startTime}
            lastSession={lastSession}
          />
        )}{" "}
        {screen === "more" && <ProfileScreen />}
        <BottomNavigation
          activeScreen={screen}
          hasActiveSession={active}
          navigate={actions.navigate}
        />
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
            demoStatus={demoStatus}
            startTime={startTime}
            elapsed={elapsed}
            lastSession={lastSession}
            resolveBlock={actions.resolveBlockedStatus}
            sessionZone={sessionZone}
          />
        )}
        {globalDetail && (
          <ProfileDetailDialog destination={globalDetail} close={actions.closeDetail} />
        )}
      </div>
      <DemoControlPanel
        scenarios={demoStatuses}
        selected={selectedDemo}
        selectStatus={actions.selectDemoStatus}
        startTest={() => {
          actions.navigate("home");
          actions.setFlow("start");
        }}
      />
    </main>
  );
}
