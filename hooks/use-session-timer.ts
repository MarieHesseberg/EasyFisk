"use client";
import { getAppNow } from "@/domain/shared/app-clock";

import { useEffect, useState } from "react";
import { elapsedSeconds } from "@/domain/sessions/session-timing";

export function useSessionTimer(active: boolean, startTime: number | null) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !startTime) return;

    const update = () => setElapsed(elapsedSeconds(startTime, getAppNow()));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active, startTime]);

  return { elapsed, setElapsed };
}
