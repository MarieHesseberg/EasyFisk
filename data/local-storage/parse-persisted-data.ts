import type { CatchRecord } from "@/domain/catches/catch";
import type { UserPreferences } from "@/domain/preferences/preferences";
import type { ActiveSessionSnapshot, SessionRecord } from "@/domain/sessions/session";

export type StoredFishingLog = {
  version: 2;
  catches: CatchRecord[];
  sessions: SessionRecord[];
  activeSession: ActiveSessionSnapshot | null;
};

type LegacySessionRecord = Omit<SessionRecord, "id">;

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
    typeof value.id === "string" &&
    isFiniteNumber(value.start) &&
    isFiniteNumber(value.end) &&
    isFiniteNumber(value.duration) &&
    typeof value.zone === "string" &&
    typeof value.result === "string"
  );
}

function isLegacySessionRecord(value: unknown): value is LegacySessionRecord {
  return (
    isObject(value) &&
    isFiniteNumber(value.start) &&
    isFiniteNumber(value.end) &&
    isFiniteNumber(value.duration) &&
    typeof value.zone === "string" &&
    typeof value.result === "string"
  );
}

function addSessionId(session: LegacySessionRecord): SessionRecord {
  return { ...session, id: `EF-OKT-${session.start}-${session.end}` };
}

function isActiveSession(value: unknown): value is ActiveSessionSnapshot {
  return (
    isObject(value) &&
    isFiniteNumber(value.startTime) &&
    (value.zone === 1 || value.zone === 2 || value.zone === 3 || value.zone === 4)
  );
}

export function parseStoredFishingLog(value: unknown): StoredFishingLog | null {
  if (!isObject(value) || !Array.isArray(value.catches)) return null;
  if (!value.catches.every(isCatchRecord)) return null;
  const activeSession = value.activeSession ?? null;
  if (activeSession !== null && !isActiveSession(activeSession)) return null;

  if (value.version === 2) {
    if (!Array.isArray(value.sessions) || !value.sessions.every(isSessionRecord)) return null;
    return { version: 2, catches: value.catches, sessions: value.sessions, activeSession };
  }

  if (value.version !== 1) return null;
  const latestSession = value.latestSession ?? null;
  if (latestSession !== null && !isLegacySessionRecord(latestSession)) return null;

  return {
    version: 2,
    catches: value.catches,
    sessions: latestSession ? [addSessionId(latestSession)] : [],
    activeSession,
  };
}

export function parseStoredPreferences(value: unknown): StoredPreferences | null {
  if (!isObject(value) || value.version !== 1 || !isObject(value.preferences)) return null;
  const preferences = value.preferences;
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
