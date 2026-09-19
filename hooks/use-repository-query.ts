"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** A changed source or newer refresh invalidates older responses, including after unmount. */
export function useRepositoryQuery<T>(read: () => Promise<T>, initial: T) {
  const [state, setState] = useState({ data: initial, loading: true, error: "" });
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const request = ++generation.current;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    try {
      const data = await read();
      if (request === generation.current) setState({ data, loading: false, error: "" });
    } catch {
      if (request === generation.current)
        setState((previous) => ({ ...previous, loading: false, error: "error.storage.read" }));
    }
  }, [read]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
      generation.current += 1;
    };
  }, [reload]);
  return { ...state, reload };
}
