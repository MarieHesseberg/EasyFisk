"use client";
import { getAppNow } from "@/domain/shared/app-clock";

import { useEffect, useState } from "react";

/** Holder tidsavhengige dokumentstatusfelt oppdatert uten urene kall under rendering. */
export function useCurrentTime(intervalMilliseconds = 60_000) {
  const [now, setNow] = useState(() => getAppNow());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(getAppNow()), intervalMilliseconds);
    return () => window.clearInterval(interval);
  }, [intervalMilliseconds]);
  return now;
}
