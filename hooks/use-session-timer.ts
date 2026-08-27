"use client";

import { useEffect, useState } from "react";
import { elapsedSeconds } from "@/domain/sessions/session-timing";

export function useSessionTimer(active: boolean, startTime: number | null) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !startTime) return;

    const update = () => setElapsed(elapsedSeconds(startTime, Date.now()));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active, startTime]);

  return { elapsed, setElapsed };
}
