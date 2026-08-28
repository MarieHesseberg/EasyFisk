"use client";

import { useState } from "react";

type LocationState =
  | "idle"
  | "loading"
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout";
const messages: Record<LocationState, string> = {
  idle: "",
  loading: "Henter posisjon …",
  success: "Posisjon funnet · foreslått Sone 3",
  "permission-denied": "Posisjonstilgang ble avslått. Velg sone manuelt.",
  unavailable: "Posisjon er ikke tilgjengelig. Velg sone manuelt.",
  timeout: "Posisjonshentingen tok for lang tid. Prøv igjen eller velg sone manuelt.",
};

export function useUserLocation(onSuccess: () => void) {
  const [state, setState] = useState<LocationState>("idle");
  function locate() {
    if (!navigator.geolocation) {
      setState("unavailable");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      () => {
        onSuccess();
        setState("success");
      },
      (error) => {
        setState(
          error.code === error.PERMISSION_DENIED
            ? "permission-denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "unavailable",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }
  return { isLoading: state === "loading", locate, message: messages[state], state };
}
