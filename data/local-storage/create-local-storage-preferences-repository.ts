import type { KeyValueStorage } from "../contracts/key-value-storage";
import type { PreferencesRepository } from "../contracts/preferences-repository";
import {
  defaultUserPreferences,
  type UserPreferences,
} from "../../domain/preferences/preferences.ts";
import { operationFailed, operationSucceeded } from "../../domain/shared/operation-result.ts";

const defaultStorageKey = "easyfisk:preferences:v1";

type StoredPreferences = { version: 1; preferences: UserPreferences };

export function createLocalStoragePreferencesRepository(
  storage: KeyValueStorage,
  key = defaultStorageKey,
): PreferencesRepository {
  return {
    getPreferences: () => {
      try {
        const value = storage.getItem(key);
        if (!value) return structuredClone(defaultUserPreferences);
        const parsed = JSON.parse(value) as Partial<StoredPreferences>;
        if (parsed.version !== 1 || !parsed.preferences) {
          return structuredClone(defaultUserPreferences);
        }
        return { ...structuredClone(defaultUserPreferences), ...parsed.preferences };
      } catch {
        return structuredClone(defaultUserPreferences);
      }
    },
    savePreferences: (preferences) => {
      try {
        storage.setItem(
          key,
          JSON.stringify({ version: 1, preferences } satisfies StoredPreferences),
        );
        return operationSucceeded(undefined);
      } catch (cause) {
        return operationFailed("Kunne ikke lagre innstillingene på enheten.", cause);
      }
    },
  };
}
