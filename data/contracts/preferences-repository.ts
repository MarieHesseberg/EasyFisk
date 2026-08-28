import type { UserPreferences } from "../../domain/preferences/preferences";
import type { OperationResult } from "../../domain/shared/operation-result";

export interface PreferencesRepository {
  getPreferences(): UserPreferences;
  savePreferences(preferences: UserPreferences): OperationResult<void>;
}
