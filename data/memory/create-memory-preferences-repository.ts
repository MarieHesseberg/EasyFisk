import type { PreferencesRepository } from "../contracts/preferences-repository";
import {
  defaultUserPreferences,
  type UserPreferences,
} from "../../domain/preferences/preferences.ts";
import { operationSucceeded } from "../../domain/shared/operation-result.ts";

export function createMemoryPreferencesRepository(
  initial: UserPreferences = defaultUserPreferences,
): PreferencesRepository {
  let preferences = structuredClone(initial);
  return {
    getPreferences: () => structuredClone(preferences),
    savePreferences: (next) => {
      preferences = structuredClone(next);
      return operationSucceeded(undefined);
    },
  };
}
