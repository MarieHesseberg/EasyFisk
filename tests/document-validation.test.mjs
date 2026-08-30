import assert from "node:assert/strict";
import test from "node:test";
import { attachmentError, validateDocument } from "../domain/documents/validate-document.ts";

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
