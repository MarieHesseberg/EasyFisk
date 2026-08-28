import type { KeyValueStorage } from "../contracts/key-value-storage";
import type { PreferencesRepository } from "../contracts/preferences-repository";
import { defaultUserPreferences } from "../../domain/preferences/preferences.ts";
import { operationFailed, operationSucceeded } from "../../domain/shared/operation-result.ts";
import { parseStoredPreferences, type StoredPreferences } from "./parse-persisted-data.ts";

const defaultStorageKey = "easyfisk:preferences:v1";

export function createLocalStoragePreferencesRepository(
  storage: KeyValueStorage,
  key = defaultStorageKey,
): PreferencesRepository {
  return {
    getPreferences: () => {
      try {
        const value = storage.getItem(key);
        if (!value) return structuredClone(defaultUserPreferences);
        const parsed = parseStoredPreferences(JSON.parse(value));
        return parsed?.preferences ?? structuredClone(defaultUserPreferences);
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
