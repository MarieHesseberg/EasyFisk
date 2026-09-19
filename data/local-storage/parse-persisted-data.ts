import { isIdentifier, isTimestamp } from "../../domain/shared/validation.ts";
import { isZoneId } from "../../domain/zones/zone-identity.ts";
import type { CatchRecord } from "@/domain/catches/catch";
import type { UserPreferences } from "@/domain/preferences/preferences";
import type { ActiveSessionSnapshot, SessionRecord } from "@/domain/sessions/session";

export type StoredFishingLog = {
  version: 3;
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

function isEditableCatch(value: unknown) {
  return (
    isObject(value) &&
    ["Laks", "Sjøørret", "Annen art"].includes(String(value.species)) &&
    ["Gjenutsatt", "Avlivet"].includes(String(value.result)) &&
    isFiniteNumber(value.length) &&
    value.length >= 0 &&
    isFiniteNumber(value.weight) &&
    value.weight >= 0 &&
    isOptionalString(value.comment)
  );
}

export function isCatchRecord(value: unknown): value is CatchRecord {
  if (!isObject(value)) return false;
  const species = value.species;
  const result = value.result;
  return (
    isIdentifier(value.id) &&
    isTimestamp(value.caughtAt) &&
    isTimestamp(value.submittedAt) &&
    isTimestamp(value.sessionStart) &&
    (value.sessionId === undefined || isIdentifier(value.sessionId)) &&
    isOptionalString(value.rulesVersion) &&
    (species === "Laks" || species === "Sjøørret" || species === "Annen art") &&
    (result === "Gjenutsatt" || result === "Avlivet") &&
    isFiniteNumber(value.length) &&
    value.length >= 0 &&
    isFiniteNumber(value.weight) &&
    value.weight >= 0 &&
    typeof value.zone === "string" &&
    (value.zoneId === undefined || isZoneId(value.zoneId)) &&
    typeof value.violation === "boolean" &&
    typeof value.late === "boolean" &&
    isOptionalString(value.imageName) &&
    isOptionalString(value.imageId) &&
    isOptionalString(value.imageData) &&
    isOptionalString(value.comment) &&
    isOptionalString(value.correction) &&
    (value.revisions === undefined ||
      (Array.isArray(value.revisions) &&
        value.revisions.every(
          (revision) =>
            isObject(revision) &&
            isFiniteNumber(revision.changedAt) &&
            typeof revision.reason === "string" &&
            isEditableCatch(revision.before) &&
            isEditableCatch(revision.after),
        )))
  );
}

export function isSessionRecord(value: unknown): value is SessionRecord {
  return (
    isObject(value) &&
    isIdentifier(value.id) &&
    isTimestamp(value.start) &&
    isTimestamp(value.end) &&
    value.end >= value.start &&
    isFiniteNumber(value.duration) &&
    value.duration >= 0 &&
    typeof value.zone === "string" &&
    (value.zoneId === undefined || isZoneId(value.zoneId)) &&
    typeof value.result === "string" &&
    isOptionalString(value.subzone)
  );
}

function isLegacySessionRecord(value: unknown): value is LegacySessionRecord {
  return (
    isObject(value) &&
    isTimestamp(value.start) &&
    isTimestamp(value.end) &&
    value.end >= value.start &&
    isFiniteNumber(value.duration) &&
    value.duration >= 0 &&
    typeof value.zone === "string" &&
    (value.zoneId === undefined || isZoneId(value.zoneId)) &&
    typeof value.result === "string" &&
    isOptionalString(value.subzone)
  );
}

function addSessionId(session: LegacySessionRecord): SessionRecord {
  return { ...session, id: `EF-OKT-${session.start}-${session.end}` };
}

export function isActiveSession(value: unknown): value is ActiveSessionSnapshot {
  return (
    isObject(value) &&
    isTimestamp(value.startTime) &&
    (value.id === undefined || isIdentifier(value.id)) &&
    (value.zone === 1 || value.zone === 2 || value.zone === 3 || value.zone === 4) &&
    isOptionalString(value.subzone)
  );
}

export function parseStoredFishingLog(value: unknown): StoredFishingLog | null {
  if (!isObject(value) || !Array.isArray(value.catches)) return null;
  if (
    !value.catches.every(isCatchRecord) ||
    new Set(value.catches.map((record) => record.id)).size !== value.catches.length
  )
    return null;
  const activeSession = value.activeSession ?? null;
  if (activeSession !== null && !isActiveSession(activeSession)) return null;

  if (value.version === 2 || value.version === 3) {
    if (!Array.isArray(value.sessions) || !value.sessions.every(isSessionRecord)) return null;
    if (new Set(value.sessions.map((record) => record.id)).size !== value.sessions.length)
      return null;
    return { version: 3, catches: value.catches, sessions: value.sessions, activeSession };
  }

  if (value.version !== 1) return null;
  const latestSession = value.latestSession ?? null;
  if (latestSession !== null && !isLegacySessionRecord(latestSession)) return null;

  return {
    version: 3,
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
