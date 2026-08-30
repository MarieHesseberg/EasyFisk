"use client";

import { useEffect, useState } from "react";

import type { PreferencesRepository } from "@/data/contracts/preferences-repository";
import { preferencesRepository } from "@/data/repositories/preferences";
import {
  defaultUserPreferences,
  type NotificationPreference,
  type UserPreferences,
} from "@/domain/preferences/preferences";
import { logger } from "@/lib/logger";

export function usePreferencesController(
  repository: PreferencesRepository = preferencesRepository,
) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setPreferences(repository.getPreferences());
    });
    return () => {
      active = false;
    };
  }, [repository]);

  function update(change: (current: UserPreferences) => UserPreferences) {
    setError("");
    const next = change(preferences);
    const result = repository.savePreferences(next);
    if (!result.ok) {
      logger.error(result.error, { cause: result.cause });
      setError(result.error);
      return;
    }
    setPreferences(next);
  }

  return {
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
