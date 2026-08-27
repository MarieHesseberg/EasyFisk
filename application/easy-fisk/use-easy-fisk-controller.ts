"use client";

import { useState } from "react";

import { completeCatchRecord } from "@/domain/catches/complete-catch-record";
import { getStatusResolution } from "@/domain/fishing-rules/status-checks";
import type { CatchRecord, DemoStatus, FlowMode, Screen, SessionRecord } from "@/domain/models";
import { createSessionRecord } from "@/domain/sessions/create-session-record";
import { findZoneName } from "@/domain/zones/find-zone-name";
import { useSessionTimer } from "@/hooks/use-session-timer";
import { useTimedToast } from "@/hooks/use-timed-toast";

export function useEasyFiskController() {
  const [screen, setScreen] = useState<Screen>("home");
  const [active, setActive] = useState(false);
  const [zone, setZone] = useState(3);
  const [flow, setFlow] = useState<FlowMode | null>(null);
  const [demoStatus, setDemoStatus] = useState<DemoStatus>("ok");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null);
  const [globalDetail, setGlobalDetail] = useState("");
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [finishAfterCatch, setFinishAfterCatch] = useState(false);
  const [sessionZone, setSessionZone] = useState(3);
  const [requestedCatchTime, setRequestedCatchTime] = useState(0);
  const [statsMineRequested, setStatsMineRequested] = useState(false);
  const { elapsed, setElapsed } = useSessionTimer(active, startTime);
  const { message: toast, showToast } = useTimedToast();

  function navigate(nextScreen: Screen) {
    if (nextScreen === "stats") setStatsMineRequested(false);
    setScreen(nextScreen);
  }

  function openSessionFlow() {
    setFlow(active ? "stop" : "start");
  }

  function finishSessionFlow(caught?: boolean, selectedZone?: number) {
    if (flow === "start") {
      startSession(selectedZone ?? zone);
      return;
    }

    if (flow === "stop") {
      if (caught) requestCatchBeforeFinish();
      else stopWithNoCatch();
      return;
    }

    setFlow(null);
    setScreen("home");
  }

  function addPastSession(record: SessionRecord, catchRecords?: CatchRecord[]) {
    setLastSession(record);
    if (catchRecords?.length) {
      const submittedAt = Date.now();
      const completed = catchRecords.map((catchRecord, index) =>
        completeCatchRecord(
          catchRecord,
          catchRecord.id === "pending" ? `ME-${submittedAt}-${index + 1}` : catchRecord.id,
          submittedAt,
        ),
      );
      setCatches((current) => [...current, ...completed]);
    }
    showToast("Tidligere fisketur er registrert");
  }

  function addCatch(record: CatchRecord) {
    const now = Date.now();
    const savedRecord = completeCatchRecord(record, `ME-${now}`, now);
    setCatches((current) => [...current, savedRecord]);
    showToast("Fangsten er lagret og kvoten er oppdatert");

    if (!finishAfterCatch) return;
    const end = Date.now();
    const start = startTime ?? end;
    setLastSession(
      createSessionRecord(
        start,
        end,
        record.zone,
        `1 ${record.species.toLowerCase()} · ${record.result.toLowerCase()}`,
      ),
    );
    setActive(false);
  }

  function correctCatch(id: string, note: string) {
    setCatches((current) =>
      current.map((item) => (item.id === id ? { ...item, correction: note } : item)),
    );
  }

  function useZone(selectedZone: number) {
    setZone(selectedZone);
    setSessionZone(selectedZone);
    setScreen("home");
    setFlow("start");
  }

  function selectDemoStatus(status: DemoStatus) {
    setDemoStatus(status);
    setActive(false);
    setFlow(null);
  }

  function resolveBlockedStatus() {
    setFlow(null);
    setGlobalDetail(getStatusResolution(demoStatus));
  }

  function completeCatchFlow() {
    setFinishAfterCatch(false);
    setFlow("summary");
  }

  function startSession(selectedZone: number) {
    const now = Date.now();
    setSessionZone(selectedZone);
    setStartTime(now);
    setElapsed(0);
    setActive(true);
    setFlow(null);
    showToast(`Fiskeøkten er startet i Sone ${selectedZone}`);
    setScreen("stats");
  }

  function requestCatchBeforeFinish() {
    setFlow(null);
    setScreen("stats");
    setFinishAfterCatch(true);
    setRequestedCatchTime(Date.now());
  }

  function stopWithNoCatch() {
    const end = Date.now();
    const start = startTime ?? end;
    const session = createSessionRecord(
      start,
      end,
      findZoneName(sessionZone),
      "Nullfangst registrert",
    );
    setElapsed(session.duration);
    setLastSession(session);
    setActive(false);
    setFlow("summary");
  }

  return {
    state: {
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
    },
    actions: {
      addCatch,
      addPastSession,
      closeDetail: () => setGlobalDetail(""),
      closeFlow: () => setFlow(null),
      completeCatchFlow,
      correctCatch,
      finishSessionFlow,
      navigate,
      openCatchHistory: () => {
        setStatsMineRequested(true);
        setScreen("stats");
      },
      openDetail: setGlobalDetail,
      openSessionFlow,
      resolveBlockedStatus,
      selectDemoStatus,
      setFlow,
      setZone,
      useZone,
    },
  };
}
