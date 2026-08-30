import assert from "node:assert/strict";
import test from "node:test";
import { attachmentError, validateDocument } from "../domain/documents/validate-document.ts";
import { getDocumentReadiness } from "../domain/documents/get-document-readiness.ts";
import { getStatusEngineDocumentReadiness } from "../domain/fishing-rules/get-status-engine-document-readiness.ts";

test("fiskekort krever riktig tidsrekkefølge", () => {
  assert.equal(
    validateDocument("permit", {
      holder: "Kari Fisker",
      issuer: "INatur",
      category: "Døgnkort",
      area: "Mandalselva · Sone 3",
      startsAt: "2026-08-20T18:00",
      endsAt: "2026-08-21T18:00",
    }),
    undefined,
  );
  assert.match(
    validateDocument("permit", {
      holder: "Kari Fisker",
      issuer: "INatur",
      category: "Døgnkort",
      area: "Sone 3",
      startsAt: "2026-08-21T18:00",
      endsAt: "2026-08-20T18:00",
    }),
    /Sluttid/,
  );
});

test("fiskeravgift krever betalingsdato for betalt avgift", () => {
  assert.match(
    validateDocument("fee", { holder: "Kari", year: "2026", category: "Enkeltperson" }),
    /betalingsdato/i,
  );
  assert.equal(
    validateDocument("fee", { holder: "Kari", year: "2026", category: "Under 18 år – fritak" }),
    undefined,
  );
});

test("dokumentvedlegg begrenses til bilde eller PDF på maksimalt 10 MB", () => {
  assert.equal(attachmentError(new Blob(["%PDF"], { type: "application/pdf" })), undefined);
  assert.match(attachmentError(new Blob(["tekst"], { type: "text/html" })), /JPG/);
  assert.match(
    attachmentError(new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: "image/jpeg" })),
    /10 MB/,
  );
});

test("fiskestart krever gyldige dokumenter av alle tre typer", () => {
  const now = new Date("2026-08-30T12:00:00+02:00").getTime();
  const base = { id: "1", updatedAt: now, values: {} };
  const incomplete = getDocumentReadiness([], now);
  assert.equal(incomplete.complete, false);
  assert.equal(incomplete.missingLabels.length, 3);
  const complete = getDocumentReadiness(
    [
      {
        ...base,
        kind: "permit",
        values: { startsAt: "2026-08-29T18:00", endsAt: "2026-08-30T18:00" },
      },
      { ...base, id: "2", kind: "disinfection", values: { performedAt: "2026-08-20T12:00" } },
      { ...base, id: "3", kind: "fee", values: { year: "2026" } },
    ],
    now,
  );
  assert.equal(complete.complete, true);
});

test("statusmotoren kan simulere alle, enkelte eller ingen manglende dokumenter", () => {
  assert.deepEqual(getStatusEngineDocumentReadiness("allMissing").valid, {
    permit: false,
    disinfection: false,
    fee: false,
  });
  assert.deepEqual(getStatusEngineDocumentReadiness("noFee").valid, {
    permit: true,
    disinfection: true,
    fee: false,
  });
  assert.equal(getStatusEngineDocumentReadiness("ok").complete, true);
});
