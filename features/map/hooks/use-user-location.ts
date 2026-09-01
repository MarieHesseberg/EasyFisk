"use client";

import { useState } from "react";

type LocationState =
  | "idle"
  | "loading"
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout";
const messages: Omit<Record<LocationState, string>, "success"> = {
  idle: "",
  loading: "Henter posisjon …",
  "permission-denied": "Posisjonstilgang ble avslått. Velg sone manuelt.",
  unavailable: "Posisjon er ikke tilgjengelig. Velg sone manuelt.",
  timeout: "Posisjonshentingen tok for lang tid. Prøv igjen eller velg sone manuelt.",
};

export function useUserLocation(
  onSuccess: (position: [latitude: number, longitude: number]) => string | undefined,
) {
  const [state, setState] = useState<LocationState>("idle");
  const [successMessage, setSuccessMessage] = useState("Posisjon funnet.");
  function locate() {
    if (!navigator.geolocation) {
      setState("unavailable");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSuccessMessage(
          onSuccess([position.coords.latitude, position.coords.longitude]) ?? "Posisjon funnet.",
        );
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
  const message = state === "success" ? successMessage : messages[state];
  return { isLoading: state === "loading", locate, message, state };
}
