"use client";

import { useEffect, useState, useRef } from "react";

import type { PreferencesRepository } from "@/data/contracts/preferences-repository";
import { useAppServices } from "@/data/runtime/services-provider";
import type { AsyncRepository } from "@/data/contracts/async-repository";
import {
  defaultUserPreferences,
  type NotificationPreference,
  type UserPreferences,
} from "@/domain/preferences/preferences";
import { logger } from "@/lib/logger";

export function usePreferencesController(
  source?: PreferencesRepository | AsyncRepository<PreferencesRepository>,
) {
  const services = useAppServices();
  const repository = source ?? services.preferences;
  const ready = useRef(false);
  const [loading, setLoading] = useState(true);
  const busy = useRef(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    ready.current = false;
    Promise.resolve()
      .then(() => repository.getPreferences())
      .then((value) => {
        if (active) {
          setPreferences(value);
          ready.current = true;
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setError("error.storage.read");
      });
    return () => {
      active = false;
    };
  }, [repository]);

  async function update(change: (current: UserPreferences) => UserPreferences) {
    if (!ready.current || busy.current) return;
    busy.current = true;
    try {
      setError("");
      const next = change(preferences);
      const result = await repository.savePreferences(next);
      if (!result.ok) {
        logger.error(result.error, { cause: result.cause });
        setError(result.error);
        return;
      }
      setPreferences(next);
    } catch {
      setError("error.storage.write");
    } finally {
      busy.current = false;
    }
  }

  return {
    loading,
    error,
    preferences,
    setNotification: (id: NotificationPreference, enabled: boolean) =>
      update((current) => ({
        ...current,
        notifications: { ...current.notifications, [id]: enabled },
      })),
    setPositionSuggestions: (enabled: boolean) =>
      update((current) => ({ ...current, positionSuggestions: enabled })),
    setShareAnonymousData: (enabled: boolean) =>
      update((current) => ({ ...current, shareAnonymousData: enabled })),
  };
}
