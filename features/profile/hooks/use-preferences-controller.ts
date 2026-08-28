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
    setPreferences((current) => {
      const next = change(current);
      const result = repository.savePreferences(next);
      if (!result.ok) {
        logger.error(result.error, { cause: result.cause });
        return current;
      }
      return next;
    });
  }

  return {
    preferences,
    addFavorite: (zone: string) =>
      update((current) => ({
        ...current,
        favoriteZones: current.favoriteZones.includes(zone)
          ? current.favoriteZones
          : [...current.favoriteZones, zone],
      })),
    removeFavorite: (zone: string) =>
      update((current) => ({
        ...current,
        favoriteZones: current.favoriteZones.filter((favorite) => favorite !== zone),
      })),
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
