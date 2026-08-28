import type { CatchRecord } from "@/domain/catches/catch";
import type { UserPreferences } from "@/domain/preferences/preferences";
import type { ActiveSessionSnapshot, SessionRecord } from "@/domain/sessions/session";

export type StoredFishingLog = {
  version: 1;
  catches: CatchRecord[];
  latestSession: SessionRecord | null;
  activeSession: ActiveSessionSnapshot | null;
};

export type StoredPreferences = { version: 1; preferences: UserPreferences };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isCatchRecord(value: unknown): value is CatchRecord {
  if (!isObject(value)) return false;
  const species = value.species;
  const result = value.result;
  return (
    typeof value.id === "string" &&
    isFiniteNumber(value.caughtAt) &&
    isFiniteNumber(value.submittedAt) &&
    isFiniteNumber(value.sessionStart) &&
    (species === "Laks" || species === "Sjøørret" || species === "Annen art") &&
    (result === "Gjenutsatt" || result === "Avlivet") &&
    isFiniteNumber(value.length) &&
    isFiniteNumber(value.weight) &&
    typeof value.zone === "string" &&
    typeof value.violation === "boolean" &&
    typeof value.late === "boolean" &&
    isOptionalString(value.imageName) &&
    isOptionalString(value.imageData) &&
    isOptionalString(value.comment) &&
    isOptionalString(value.correction)
  );
}

function isSessionRecord(value: unknown): value is SessionRecord {
  return (
    isObject(value) &&
    isFiniteNumber(value.start) &&
    isFiniteNumber(value.end) &&
    isFiniteNumber(value.duration) &&
    typeof value.zone === "string" &&
    typeof value.result === "string"
  );
}

function isActiveSession(value: unknown): value is ActiveSessionSnapshot {
  return (
    isObject(value) &&
    isFiniteNumber(value.startTime) &&
    (value.zone === 1 || value.zone === 2 || value.zone === 3 || value.zone === 4)
  );
}

export function parseStoredFishingLog(value: unknown): StoredFishingLog | null {
  if (!isObject(value) || value.version !== 1 || !Array.isArray(value.catches)) return null;
  if (!value.catches.every(isCatchRecord)) return null;
  if (value.latestSession !== null && !isSessionRecord(value.latestSession)) return null;
  const activeSession = value.activeSession ?? null;
  if (activeSession !== null && !isActiveSession(activeSession)) return null;

  return {
    version: 1,
    catches: value.catches,
    latestSession: value.latestSession,
    activeSession,
  };
}

export function parseStoredPreferences(value: unknown): StoredPreferences | null {
  if (!isObject(value) || value.version !== 1 || !isObject(value.preferences)) return null;
  const preferences = value.preferences;
  if (!Array.isArray(preferences.favoriteZones)) return null;
  if (!preferences.favoriteZones.every((zone) => typeof zone === "string")) return null;
  if (!isObject(preferences.notifications)) return null;
  const notifications = preferences.notifications;
  if (
    typeof notifications.emergencyClosure !== "boolean" ||
    typeof notifications.highTemperature !== "boolean" ||
    typeof notifications.ruleChanges !== "boolean" ||
    typeof notifications.reportingDeadline !== "boolean" ||
    typeof preferences.positionSuggestions !== "boolean" ||
    typeof preferences.shareAnonymousData !== "boolean"
  ) {
    return null;
  }

  return {
    version: 1,
    preferences: {
      favoriteZones: preferences.favoriteZones,
      notifications: {
        emergencyClosure: notifications.emergencyClosure,
        highTemperature: notifications.highTemperature,
        ruleChanges: notifications.ruleChanges,
        reportingDeadline: notifications.reportingDeadline,
      },
      positionSuggestions: preferences.positionSuggestions,
      shareAnonymousData: preferences.shareAnonymousData,
    },
  };
}
