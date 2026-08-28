import assert from "node:assert/strict";
import test from "node:test";

import { createLocalStorageFishingLogRepository } from "../data/local-storage/create-local-storage-fishing-log-repository.ts";
import { createLocalStoragePreferencesRepository } from "../data/local-storage/create-local-storage-preferences-repository.ts";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

const catchRecord = {
  id: "ME-LOCAL-1",
  caughtAt: 2_000,
  submittedAt: 2_100,
  sessionStart: 1_000,
  species: "Laks",
  result: "Gjenutsatt",
  length: 70,
  weight: 4,
  zone: "Sone 3 · Øyslebø–Laudal",
  violation: false,
  late: false,
};

test("localStorage-adapter beholder fangst og korrigering mellom instanser", () => {
  const storage = createStorage();
  const first = createLocalStorageFishingLogRepository(storage);
  first.saveCatch(catchRecord);
  first.updateCatchCorrection(catchRecord.id, "Kontrollert");

  const reloaded = createLocalStorageFishingLogRepository(storage);

  assert.equal(reloaded.listCatches()[0].correction, "Kontrollert");
});

test("localStorage-adapter beholder siste fiskeøkt", () => {
  const storage = createStorage();
  const repository = createLocalStorageFishingLogRepository(storage);
  const session = { start: 1_000, end: 4_000, duration: 3, zone: "Sone 3", result: "Nullfangst" };

  repository.saveSession(session);

  assert.deepEqual(createLocalStorageFishingLogRepository(storage).getLatestSession(), session);
});

test("aktiv fiskeøkt overlever refresh og kan avsluttes", () => {
  const storage = createStorage();
  const repository = createLocalStorageFishingLogRepository(storage);
  const activeSession = { startTime: 1_000, zone: 3 };
  assert.equal(repository.saveActiveSession(activeSession).ok, true);
  assert.deepEqual(
    createLocalStorageFishingLogRepository(storage).getActiveSession(),
    activeSession,
  );
  repository.saveActiveSession(null);
  assert.equal(createLocalStorageFishingLogRepository(storage).getActiveSession(), null);
});

test("localStorage quota-feil returneres som et forståelig resultat", () => {
  const storage = {
    getItem: () => null,
    setItem: () => {
      throw new DOMException("full", "QuotaExceededError");
    },
  };
  const result = createLocalStorageFishingLogRepository(storage).saveCatch(catchRecord);
  assert.equal(result.ok, false);
  assert.match(result.error, /Kunne ikke lagre/);
});

test("feil under sluttlagring etterlater ingen delvis lagret økt", () => {
  const values = new Map();
  let failWrites = false;
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new DOMException("full", "QuotaExceededError");
      values.set(key, value);
    },
  };
  const repository = createLocalStorageFishingLogRepository(storage);
  const activeSession = { startTime: 1_000, zone: 3 };
  repository.saveActiveSession(activeSession);
  failWrites = true;

  const result = repository.saveCompletedSession(
    { start: 1_000, end: 4_000, duration: 3, zone: "Sone 3", result: "1 fangst" },
    [catchRecord],
    true,
  );

  assert.equal(result.ok, false);
  assert.equal(repository.getLatestSession(), null);
  assert.deepEqual(repository.listCatches(), []);
  assert.deepEqual(repository.getActiveSession(), activeSession);
});

test("ødelagt localStorage-data gir trygge standardverdier", () => {
  const storage = createStorage();
  storage.setItem("easyfisk:fishing-log:v1", "ikke gyldig JSON");

  assert.deepEqual(createLocalStorageFishingLogRepository(storage).listCatches(), []);
});

test("syntaktisk gyldig JSON med ugyldige domenedata avvises", () => {
  const storage = createStorage();
  storage.setItem(
    "easyfisk:fishing-log:v1",
    JSON.stringify({
      version: 1,
      catches: [{ ...catchRecord, species: "Ukjent art", caughtAt: "i går" }],
      latestSession: null,
    }),
  );

  const repository = createLocalStorageFishingLogRepository(storage);
  assert.deepEqual(repository.listCatches(), []);
  assert.equal(repository.getLatestSession(), null);
});

test("ugyldige innstillingstyper erstattes med sikre standardverdier", () => {
  const storage = createStorage();
  storage.setItem(
    "easyfisk:preferences:v1",
    JSON.stringify({
      version: 1,
      preferences: {
        favoriteZones: [3],
        notifications: { highTemperature: "ja" },
        positionSuggestions: "ja",
        shareAnonymousData: null,
      },
    }),
  );

  const preferences = createLocalStoragePreferencesRepository(storage).getPreferences();
  assert.equal(preferences.positionSuggestions, true);
  assert.equal(preferences.notifications.highTemperature, true);
  assert.equal(typeof preferences.favoriteZones[0], "string");
});

test("profilinnstillinger beholdes etter ny repository-instans", () => {
  const storage = createStorage();
  const repository = createLocalStoragePreferencesRepository(storage);
  const preferences = repository.getPreferences();
  preferences.notifications.highTemperature = false;
  preferences.favoriteZones = ["Sone 4 · Laudal–Bjelland"];
  repository.savePreferences(preferences);

  const reloaded = createLocalStoragePreferencesRepository(storage).getPreferences();

  assert.equal(reloaded.notifications.highTemperature, false);
  assert.deepEqual(reloaded.favoriteZones, ["Sone 4 · Laudal–Bjelland"]);
});
