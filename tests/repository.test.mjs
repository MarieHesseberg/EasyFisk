import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("kodebasen følger den avtalte mappestrukturen", async () => {
  const directories = [
    "components/layout",
    "components/ui",
    "data/mock",
    "domain/catches",
    "domain/fishing-rules",
    "domain/quotas",
    "domain/sessions",
    "domain/zones",
    "features/catch-report",
    "features/feedback",
    "features/fishing-session",
    "features/history",
    "features/home",
    "features/map",
    "features/profile",
    "features/rules",
    "features/statistics",
    "hooks",
    "lib",
    "styles",
  ];

  await Promise.all(
    directories.map((directory) => access(new URL(`../${directory}/`, import.meta.url))),
  );
});

test("ruten er liten og delegerer til applikasjonslaget", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.ok(page.split("\n").length <= 15);
  assert.match(page, /<EasyFiskApp \/>/);
});
