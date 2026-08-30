"use client";

import { useEffect, useState } from "react";

/** Holder tidsavhengige dokumentstatusfelt oppdatert uten urene kall under rendering. */
export function useCurrentTime(intervalMilliseconds = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), intervalMilliseconds);
    return () => window.clearInterval(interval);
  }, [intervalMilliseconds]);
  return now;
}
