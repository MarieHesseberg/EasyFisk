"use client";
import { createId } from "@/domain/shared/create-id";
import { getAppNow } from "@/domain/shared/app-clock";

import { useEffect, useState, useRef } from "react";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import type { AsyncRepository } from "@/data/contracts/async-repository";
import { technicalOperationFailed, operationFailed } from "@/domain/shared/operation-result";
import type { ZoneId } from "@/domain/zones/zone";
import { useSessionTimer } from "@/hooks/use-session-timer";

export function useActiveSessionController(
  repository: FishingLogRepository | AsyncRepository<FishingLogRepository>,
) {
  const busy = useRef(false);
  const [sessionLoading, setLoading] = useState(true);
  const [sessionError, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionZone, setSessionZone] = useState<ZoneId>(3);
  const [sessionSubzone, setSessionSubzone] = useState<string | undefined>();
  const [finishAfterCatch, setFinishAfterCatch] = useState(false);
  const [requestedCatchTime, setRequestedCatchTime] = useState(0);
  const { elapsed, setElapsed } = useSessionTimer(active, startTime);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setLoading(true);
    });
    Promise.resolve()
      .then(() => repository.getActiveSession())
      .then((restoredSession) => {
        if (!isMounted) return;
        setError("");
        setActive(!!restoredSession);
        if (restoredSession) {
          setSessionId(restoredSession.id ?? `legacy-active-${restoredSession.startTime}`);
          setStartTime(restoredSession.startTime);
          setSessionZone(restoredSession.zone);
          setSessionSubzone(restoredSession.subzone);
        }
      })
      .catch(() => {
        if (isMounted) setError("error.storage.read");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [repository]);

  async function start(selectedZone: ZoneId, subzone?: string) {
    if (busy.current || sessionLoading || sessionError)
      return operationFailed("Vent til opplysningene er lastet inn.");
    busy.current = true;
    try {
      const now = getAppNow();
      const id = `EF-OKT-${createId()}`;
      const result = await repository.saveActiveSession({
        id,
        startTime: now,
        zone: selectedZone,
        ...(subzone ? { subzone } : {}),
      });
      if (!result.ok) return result;
      setSessionId(id);
      setSessionZone(selectedZone);
      setSessionSubzone(subzone);
      setStartTime(now);
      setElapsed(0);
      setActive(true);
      return result;
    } catch (cause) {
      return technicalOperationFailed("storage.write", cause);
    } finally {
      busy.current = false;
    }
  }

  async function stop() {
    const result = await repository.saveActiveSession(null);
    if (result.ok) setActive(false);
    return result;
  }

  function requestCatchBeforeFinish() {
    setFinishAfterCatch(true);
    setRequestedCatchTime(getAppNow());
  }

  return {
    state: {
      sessionId,
      sessionLoading,
      sessionError,
      active,
      elapsed,
      finishAfterCatch,
      requestedCatchTime,
      sessionZone,
      sessionSubzone,
      startTime,
    },
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
