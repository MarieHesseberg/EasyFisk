import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import {
  addCalendarDays,
  isCalendarDate,
  parseRiverDateTime,
  riverDate,
  riverDateTime,
} from "../domain/shared/river-time.ts";
import { isPermitValid } from "../domain/documents/get-permit-zones.ts";
import { validateDocument } from "../domain/documents/validate-document.ts";
import { validateAccessGrant } from "../domain/documents/access-grants.ts";
import { elapsedSeconds } from "../domain/sessions/session-timing.ts";
import { formatDateTime } from "../lib/localization-format.ts";

test("calendar dates reject overflow, preserve leap days and cross year boundaries", () => {
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "2026-1-01", "yesterday"])
    assert.equal(isCalendarDate(value), false);
  assert.equal(isCalendarDate("2024-02-29"), true);
  assert.equal(addCalendarDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addCalendarDays("2026-12-31", 1), "2027-01-01");
  assert.throws(() => addCalendarDays("2026-02-30", 1));
});

test("Norwegian wall time uses winter/summer offset and respects explicit instants", () => {
  assert.equal(parseRiverDateTime("2026-01-10T12:00"), Date.parse("2026-01-10T11:00Z"));
  assert.equal(parseRiverDateTime("2026-08-20T12:00"), Date.parse("2026-08-20T10:00Z"));
  assert.equal(
    parseRiverDateTime("2026-08-20T12:00:01.123+02:00"),
    Date.parse("2026-08-20T10:00:01.123Z"),
  );
  assert.equal(riverDate(Date.parse("2026-12-31T23:30Z")), "2027-01-01");
  assert.equal(riverDateTime(Date.parse("2026-08-19T22:00Z")), "2026-08-20T00:00:00");
  for (const value of [
    "2026-02-30T12:00",
    "2026-08-20T24:00",
    "2026-08-20T12:60",
    "2026-08-20",
    "2026-08-20T12:00+99:00",
  ])
    assert.ok(Number.isNaN(parseRiverDateTime(value)));
});

test("spring gap is rejected, autumn overlap has an explicit deterministic policy", () => {
  assert.ok(Number.isNaN(parseRiverDateTime("2026-03-29T02:30")));
  assert.equal(parseRiverDateTime("2026-10-25T02:30"), Date.parse("2026-10-25T00:30Z"));
  assert.equal(parseRiverDateTime("2026-10-25T02:30", "later"), Date.parse("2026-10-25T01:30Z"));
  assert.ok(Number.isNaN(parseRiverDateTime("2026-10-25T02:30", "reject")));
  assert.equal(
    elapsedSeconds(parseRiverDateTime("2026-03-29T01:30"), parseRiverDateTime("2026-03-29T03:30")),
    3600,
  );
  assert.equal(
    elapsedSeconds(parseRiverDateTime("2026-10-25T01:30"), parseRiverDateTime("2026-10-25T03:30")),
    10800,
  );
});

const permit = {
  id: "p",
  kind: "permit",
  ownerEmail: "owner@example.no",
  updatedAt: 1,
  values: {
    holder: "Test Fisker",
    issuer: "Test",
    category: "Grunneierkort",
    area: "Sone 3",
    startsAt: "2026-08-20T18:00",
    endsAt: "2026-08-21T17:59",
  },
};
test("validity boundaries are Norwegian instants; mixed offsets compare chronologically", () => {
  const start = Date.parse("2026-08-20T16:00Z");
  const end = Date.parse("2026-08-21T15:59Z");
  assert.equal(isPermitValid(permit, start - 1), false);
  assert.equal(isPermitValid(permit, start), true);
  assert.equal(isPermitValid(permit, end), true);
  assert.equal(isPermitValid(permit, end + 1), false);
  assert.equal(
    validateDocument("permit", {
      ...permit.values,
      startsAt: "2026-08-20T18:00+02:00",
      endsAt: "2026-08-20T17:00Z",
    }),
    undefined,
  );
  assert.ok(validateDocument("permit", { ...permit.values, startsAt: "2026-03-29T02:30" }));
  const grant = {
    id: "g",
    recipientName: "Guest Test",
    recipientEmail: "guest@example.no",
    role: "guest",
    createdAt: 1,
    startsAt: "2026-08-20T16:00Z",
    endsAt: "2026-08-21T15:59Z",
  };
  assert.equal(validateAccessGrant(permit, grant, permit.ownerEmail), undefined);
  assert.ok(
    validateAccessGrant(
      { ...permit, values: { ...permit.values, startsAt: "invalid" } },
      grant,
      permit.ownerEmail,
    ),
  );
});

test("displaying a wall time no longer shifts it a second time", () => {
  assert.match(formatDateTime("2026-08-20T18:00", "no"), /18:00/);
  assert.match(formatDateTime("2026-08-20T16:00Z", "en"), /18:00/);
});

test("the same code gives identical results with Oslo, American and Asian device time zones", () => {
  const script = `
    import assert from 'node:assert/strict';
    import { parseRiverDateTime, riverDate } from './domain/shared/river-time.ts';
    import { isPermitValid } from './domain/documents/get-permit-zones.ts';
    import { formatDateTime } from './lib/localization-format.ts';
    const start = parseRiverDateTime('2026-08-20T18:00');
    assert.equal(start, Date.parse('2026-08-20T16:00Z'));
    assert.equal(isPermitValid(${JSON.stringify(permit)}, start), true);
    assert.equal(riverDate(Date.parse('2026-08-19T22:30Z')), '2026-08-20');
    assert.match(formatDateTime('2026-08-20T18:00', 'no'), /18:00/);
  `;
  for (const TZ of ["Europe/Oslo", "UTC", "America/Los_Angeles", "Asia/Tokyo"]) {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--input-type=module", "-e", script],
      { env: { ...process.env, TZ }, encoding: "utf8" },
    );
    assert.equal(result.status, 0, `${TZ}: ${result.stderr}`);
  }
});
