"use client";

import { useEffect, useState } from "react";

export function useTimedToast(duration = 2400) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => setMessage(""), duration);
    return () => clearTimeout(timeout);
  }, [duration, message]);

  return { message, showToast: setMessage };
}
