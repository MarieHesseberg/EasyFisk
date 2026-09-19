"use client";

import { useEffect, useState } from "react";
import { TEST_GUIDE_STORAGE_KEY, TEST_GUIDE_VERSION } from "./guide-version";

export function useTestGuide(enabled: boolean) {
  const [status, setStatus] = useState<"loading" | "open" | "closed">("loading");
  useEffect(() => {
    let completed = false;
    try {
      completed = localStorage.getItem(TEST_GUIDE_STORAGE_KEY) === TEST_GUIDE_VERSION;
    } catch {
      // The guide still works when browser storage is unavailable.
    }
    const timer = window.setTimeout(() => setStatus(enabled && !completed ? "open" : "closed"), 0);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  function complete() {
    try {
      localStorage.setItem(TEST_GUIDE_STORAGE_KEY, TEST_GUIDE_VERSION);
    } catch {
      // Completion applies to this visit even if it cannot be remembered.
    }
    setStatus("closed");
  }

  return {
    open: enabled && status === "open",
    blocking: enabled && status !== "closed",
    show: () => setStatus("open"),
    complete,
  };
}
