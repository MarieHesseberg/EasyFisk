"use client";

import { useState } from "react";
import type { ZoneId } from "@/domain/zones/zone";
import { useSessionTimer } from "@/hooks/use-session-timer";

export function useActiveSessionController() {
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionZone, setSessionZone] = useState<ZoneId>(3);
  const [finishAfterCatch, setFinishAfterCatch] = useState(false);
  const [requestedCatchTime, setRequestedCatchTime] = useState(0);
  const { elapsed, setElapsed } = useSessionTimer(active, startTime);

  function start(selectedZone: ZoneId) {
    const now = Date.now();
    setSessionZone(selectedZone);
    setStartTime(now);
    setElapsed(0);
    setActive(true);
  }

  function requestCatchBeforeFinish() {
    setFinishAfterCatch(true);
    setRequestedCatchTime(Date.now());
  }

  return {
    state: { active, elapsed, finishAfterCatch, requestedCatchTime, sessionZone, startTime },
    actions: {
      requestCatchBeforeFinish,
      setActive,
      setElapsed,
      setFinishAfterCatch,
      setSessionZone,
      start,
    },
  };
}
