"use client";
import { catchBelongsToSession } from "@/domain/sessions/catch-belongs-to-session";
import { getAppNow } from "@/domain/shared/app-clock";

import { selectLocalized } from "@/locales";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { useAppServices } from "@/data/runtime/services-provider";
import type { AsyncRepository } from "@/data/contracts/async-repository";
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
import { useLanguage } from "@/components/localization/language-provider";
function sessionResult(count: number) {
  return count ? `${count} fangst${count === 1 ? "" : "er"}` : "Nullfangst registrert";
}

export function useEasyFiskController(
  source?: FishingLogRepository | AsyncRepository<FishingLogRepository>,
) {
  const services = useAppServices();
  const repository = source ?? services.fishingLog;
  const { language, t } = useLanguage();
  const navigation = useAppNavigationController();
  const session = useActiveSessionController(repository);
  const log = useFishingLogController(repository);
  const { message: toast, showToast } = useTimedToast();
  const { demoStatus, flow, zone } = navigation.state;
  const { active, finishAfterCatch, sessionZone, sessionSubzone, startTime, sessionId } =
    session.state;
  async function finishSessionFlow(caught?: boolean, selectedZone?: ZoneId, subzone?: string) {
    if (flow === "start") {
      const selected = selectedZone ?? zone;
      const result = await session.actions.start(selected, subzone);
      if (!result.ok) {
        showToast(t(result.error));
        return;
      }
      navigation.actions.setZone(selected);
      navigation.actions.closeFlow();
      navigation.actions.navigate("home");
      showToast(
        selectLocalized(
          language,
          `Fiskeøkten er startet i Sone ${selected}`,
          `The fishing session has started in Zone ${selected}`,
        ),
      );
      return;
    }
    if (flow === "stop" && caught) {
      navigation.actions.closeFlow();
      navigation.actions.setScreen("home");
      session.actions.requestCatchBeforeFinish();
      return;
    }
    if (flow === "stop") {
      const end = getAppNow();
      const startedAt = startTime ?? end;
      const completed = createSessionRecord(
        startedAt,
        end,
        findZoneName(sessionZone, fishingContentRepository.getZones(), sessionSubzone),
        sessionResult(
          log.state.catches.filter((record) =>
            catchBelongsToSession(record, { id: sessionId ?? "", start: startedAt }),
          ).length,
        ),
        sessionSubzone,
        sessionId,
        sessionZone,
      );
      const result = await log.actions.saveCompletedSession(completed, [], true);
      if (!result.ok) {
        showToast(t(result.error));
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
  async function addCatch(record: CatchRecord) {
    record = { ...record, sessionId, zoneId: sessionZone };
    if (finishAfterCatch) {
      const end = getAppNow();
      const completedSession = createSessionRecord(
        startTime ?? end,
        end,
        record.zone,
        sessionResult(
          log.state.catches.filter((existing) =>
            catchBelongsToSession(existing, { id: sessionId ?? "", start: startTime ?? end }),
          ).length + 1,
        ),
        sessionSubzone,
        sessionId,
        sessionZone,
      );
      const completedResult = await log.actions.saveCompletedSession(
        completedSession,
        [record],
        true,
      );
      if (!completedResult.ok) {
        showToast(t(completedResult.error));
        return completedResult;
      }
      session.actions.setActive(false);
      showToast(t("copy.fangsten.er.lagret.og.kvoten.er.oppdatert.a7b60a8"));
      return completedResult;
    }
    const savedResult = await log.actions.saveCatch(record);
    if (!savedResult.ok) {
      showToast(t(savedResult.error));
      return savedResult;
    }
    showToast(t("copy.fangsten.er.lagret.og.kvoten.er.oppdatert.a7b60a8"));
    return savedResult;
  }
  async function addPastSession(record: SessionRecord, records?: CatchRecord[]) {
    const result = await log.actions.savePastSession(record, records);
    showToast(t(result.ok ? "Tidligere fisketur er registrert" : result.error));
    return result;
  }
  function selectDemoStatus(status: typeof demoStatus) {
    navigation.actions.setSelectedDemoStatus(status);
  }
  function startStatusTest() {
    if (services.mode !== "demo") return false;
    if (active) {
      showToast(
        selectLocalized(
          language,
          "Avslutt den aktive fisketuren før du aktiverer en testsituasjon.",
          "Finish your active fishing trip before activating a test scenario.",
        ),
      );
      return false;
    }
    navigation.actions.setDemoStatus(navigation.state.selectedDemoStatus);
    navigation.actions.setIsStatusTestMode(true);
    navigation.actions.closeFlow();
    return true;
  }
  function useZone(selectedZone: ZoneId) {
    navigation.actions.setZone(selectedZone);
    if (active) {
      showToast(
        selectLocalized(
          language,
          "Sone valgt i kartet. Den aktive turen er uendret.",
          "Map zone selected. Your active trip is unchanged.",
        ),
      );
      return;
    }
    navigation.actions.setScreen("home");
    navigation.actions.setFlow("start");
  }
  return {
    state: {
      ...navigation.state,
      ...session.state,
      ...log.state,
      toast,
      demoEnabled: services.mode === "demo",
    },
    actions: {
      ...navigation.actions,
      dismissCatchFlow: () => session.actions.setFinishAfterCatch(false),
      addCatch,
      addPastSession,
      cancelCatchBeforeFinish: () => {
        session.actions.setFinishAfterCatch(false);
        if (active) navigation.actions.setFlow("stop");
      },
      completeCatchFlow: () => {
        session.actions.setFinishAfterCatch(false);
        navigation.actions.setFlow("summary");
      },
      correctCatch: log.actions.correctCatch,
      finishSessionFlow,
      openSessionFlow: () => navigation.actions.setFlow(active ? "stop" : "start"),
      resolveBlockedStatus: (status = demoStatus) => {
        navigation.actions.closeFlow();
        if (status === "dailyQuota" || status === "seasonQuota")
          navigation.actions.navigate("rules");
        else navigation.actions.openDetail(getStatusResolution(status));
      },
      selectDemoStatus,
      startStatusTest,
      useActualStatus: () => {
        navigation.actions.setIsStatusTestMode(false);
        navigation.actions.setDemoStatus("allMissing");
        navigation.actions.setSelectedDemoStatus("allMissing");
        navigation.actions.setPaymentOutcome("approved");
        navigation.actions.closeFlow();
      },
      useZone,
    },
  };
}
