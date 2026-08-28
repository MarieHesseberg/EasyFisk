"use client";

import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { fishingLogRepository } from "@/data/repositories/fishing-log";
import type { CatchRecord } from "@/domain/catches/catch";
import { getStatusResolution } from "@/domain/fishing-rules/status-checks";
import { createSessionRecord } from "@/domain/sessions/create-session-record";
import type { SessionRecord } from "@/domain/sessions/session";
import type { ZoneId } from "@/domain/zones/zone";
import { findZoneName } from "@/domain/zones/find-zone-name";
import { useTimedToast } from "@/hooks/use-timed-toast";
import { useActiveSessionController } from "./use-active-session-controller";
import { useAppNavigationController } from "./use-app-navigation-controller";
import { useFishingLogController } from "./use-fishing-log-controller";

export function useEasyFiskController(repository: FishingLogRepository = fishingLogRepository) {
  const navigation = useAppNavigationController();
  const session = useActiveSessionController(repository);
  const log = useFishingLogController(repository);
  const { message: toast, showToast } = useTimedToast();
  const { demoStatus, flow, zone } = navigation.state;
  const { active, finishAfterCatch, sessionZone, startTime } = session.state;

  function finishSessionFlow(caught?: boolean, selectedZone?: ZoneId) {
    if (flow === "start") {
      const selected = selectedZone ?? zone;
      const result = session.actions.start(selected);
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      navigation.actions.closeFlow();
      navigation.actions.navigate("stats");
      showToast(`Fiskeøkten er startet i Sone ${selected}`);
      return;
    }
    if (flow === "stop" && caught) {
      navigation.actions.closeFlow();
      navigation.actions.setScreen("stats");
      session.actions.requestCatchBeforeFinish();
      return;
    }
    if (flow === "stop") {
      const end = Date.now();
      const startedAt = startTime ?? end;
      const completed = createSessionRecord(
        startedAt,
        end,
        findZoneName(sessionZone, fishingContentRepository.getZones()),
        "Nullfangst registrert",
      );
      const result = log.actions.saveCompletedSession(completed, [], true);
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      session.actions.setElapsed(completed.duration);
      session.actions.setActive(false);
      navigation.actions.setFlow("summary");
      return;
    }
    navigation.actions.closeFlow();
    navigation.actions.setScreen("home");
  }

  function addCatch(record: CatchRecord) {
    if (finishAfterCatch) {
      const end = Date.now();
      const completedSession = createSessionRecord(
        startTime ?? end,
        end,
        record.zone,
        `1 ${record.species.toLowerCase()} · ${record.result.toLowerCase()}`,
      );
      const completedResult = log.actions.saveCompletedSession(completedSession, [record], true);
      if (!completedResult.ok) {
        showToast(completedResult.error);
        return completedResult;
      }
      session.actions.setActive(false);
      showToast("Fangsten er lagret og kvoten er oppdatert");
      return completedResult;
    }

    const savedResult = log.actions.saveCatch(record);
    if (!savedResult.ok) {
      showToast(savedResult.error);
      return savedResult;
    }
    showToast("Fangsten er lagret og kvoten er oppdatert");
    return savedResult;
  }

  function addPastSession(record: SessionRecord, records?: CatchRecord[]) {
    const result = log.actions.savePastSession(record, records);
    showToast(result.ok ? "Tidligere fisketur er registrert" : result.error);
    return result;
  }

  function selectDemoStatus(status: typeof demoStatus) {
    const stopResult = session.actions.stop();
    if (!stopResult.ok) {
      showToast(stopResult.error);
      return;
    }
    navigation.actions.setDemoStatus(status);
    navigation.actions.closeFlow();
  }

  function useZone(selectedZone: ZoneId) {
    navigation.actions.setZone(selectedZone);
    session.actions.setSessionZone(selectedZone);
    navigation.actions.setScreen("home");
    navigation.actions.setFlow("start");
  }

  return {
    state: { ...navigation.state, ...session.state, ...log.state, toast },
    actions: {
      ...navigation.actions,
      addCatch,
      addPastSession,
      completeCatchFlow: () => {
        session.actions.setFinishAfterCatch(false);
        navigation.actions.setFlow("summary");
      },
      correctCatch: log.actions.correctCatch,
      finishSessionFlow,
      openSessionFlow: () => navigation.actions.setFlow(active ? "stop" : "start"),
      resolveBlockedStatus: () => {
        navigation.actions.closeFlow();
        navigation.actions.openDetail(getStatusResolution(demoStatus));
      },
      selectDemoStatus,
      useZone,
    },
  };
}
