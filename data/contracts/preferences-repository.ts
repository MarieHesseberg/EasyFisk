import type { UserPreferences } from "../../domain/preferences/preferences";

export interface PreferencesRepository {
  getPreferences(): UserPreferences;
  savePreferences(preferences: UserPreferences): void;
}
