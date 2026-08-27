import type { PreferencesRepository } from "../contracts/preferences-repository";
import {
  defaultUserPreferences,
  type UserPreferences,
} from "../../domain/preferences/preferences.ts";

export function createMemoryPreferencesRepository(
  initial: UserPreferences = defaultUserPreferences,
): PreferencesRepository {
  let preferences = structuredClone(initial);
  return {
    getPreferences: () => structuredClone(preferences),
    savePreferences: (next) => {
      preferences = structuredClone(next);
    },
  };
}
