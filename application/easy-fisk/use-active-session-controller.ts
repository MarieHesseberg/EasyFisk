"use client";

import { useEffect, useState } from "react";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import type { ZoneId } from "@/domain/zones/zone";
import { useSessionTimer } from "@/hooks/use-session-timer";

export function useActiveSessionController(repository: FishingLogRepository) {
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionZone, setSessionZone] = useState<ZoneId>(3);
  const [finishAfterCatch, setFinishAfterCatch] = useState(false);
  const [requestedCatchTime, setRequestedCatchTime] = useState(0);
  const { elapsed, setElapsed } = useSessionTimer(active, startTime);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;
      const restoredSession = repository.getActiveSession();
      if (!restoredSession) return;
      setStartTime(restoredSession.startTime);
      setSessionZone(restoredSession.zone);
      setActive(true);
    });
    return () => {
      isMounted = false;
    };
  }, [repository]);

  function start(selectedZone: ZoneId) {
    const now = Date.now();
    const result = repository.saveActiveSession({ startTime: now, zone: selectedZone });
    if (!result.ok) return result;
    setSessionZone(selectedZone);
    setStartTime(now);
    setElapsed(0);
    setActive(true);
    return result;
  }

  function stop() {
    const result = repository.saveActiveSession(null);
    if (result.ok) setActive(false);
    return result;
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
      stop,
    },
  };
}
