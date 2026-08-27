import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("appen har norsk språk og riktig produktnavn", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /<html lang="no">/);
  assert.match(layout, /title: "EasyFisk"/);
});

test("visuell referanse er dokumentert", async () => {
  const baseline = await readFile(new URL("../visual-baseline/README.md", import.meta.url), "utf8");

  assert.match(baseline, /iPhone-referanse/);
  assert.match(baseline, /Android-referanse/);
  assert.match(baseline, /Godkjenningskrav/);
});

