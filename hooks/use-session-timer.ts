"use client";

import { useEffect, useState } from "react";

export function useSessionTimer(active: boolean, startTime: number | null) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !startTime) return;

    const update = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active, startTime]);

  return { elapsed, setElapsed };
}
