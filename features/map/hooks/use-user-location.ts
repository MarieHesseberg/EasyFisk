"use client";

import { useState } from "react";
import { useLanguage } from "@/components/localization/language-provider";

type LocationState =
  | "idle"
  | "loading"
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout";
const messageKeys: Omit<Record<LocationState, string>, "success"> = {
  idle: "",
  loading: "location.loading",
  "permission-denied": "location.permissionDenied",
  unavailable: "location.unavailable",
  timeout: "location.timeout",
};

export function useUserLocation(
  onSuccess: (position: [latitude: number, longitude: number]) => string | undefined,
) {
  const { t } = useLanguage();
  const [state, setState] = useState<LocationState>("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  function locate() {
    if (!navigator.geolocation) {
      setState("unavailable");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSuccessMessage(onSuccess([position.coords.latitude, position.coords.longitude]) ?? null);
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
  const message =
    state === "success" ? (successMessage ?? t("location.found")) : t(messageKeys[state]);
  return { isLoading: state === "loading", locate, message, state };
}
