import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { locales, t } from "../locales/index.ts";
import {
  formatCurrencyNok,
  formatDate,
  formatDecimal,
  formatDurationValue,
  formatPlural,
} from "../lib/localization-format.ts";

test("norsk og engelsk har nøyaktig de samme oversettelsesnøklene", () => {
  assert.deepEqual(Object.keys(locales.en).sort(), Object.keys(locales.no).sort());
});

test("oversettelseskatalogen gjenbruker nøkler i stedet for å duplisere tekst", () => {
  const pairs = Object.keys(locales.no).map((key) => `${locales.no[key]}\u0000${locales.en[key]}`);
  assert.equal(new Set(pairs).size, pairs.length);
});

test("typet oversettelse erstatter navngitte variabler", () => {
  assert.equal(t("no", "common.zone", { number: 3 }), "Sone 3");
  assert.equal(t("en", "common.zone", { number: 3 }), "Zone 3");
});

test("felles formattering følger valgt språk", () => {
  assert.equal(formatDecimal(1234.5, "no"), "1 234,5");
  assert.equal(formatDecimal(1234.5, "en"), "1,234.5");
  assert.match(formatCurrencyNok(455, "no"), /455/);
  assert.match(formatCurrencyNok(455, "en"), /455/);
  assert.equal(formatDate("2026-08-31T12:00:00Z", "en"), "31 Aug 2026");
  assert.equal(formatDurationValue(3665, "en"), "1 hr 1 min");
});

test("flertallsformatteringen velger riktig form", () => {
  const forms = { one: "{count} permit", other: "{count} permits" };
  assert.equal(formatPlural(1, "en", forms), "1 permit");
  assert.equal(formatPlural(2, "en", forms), "2 permits");
});

test("det gamle DOM-baserte oversettelsessystemet kan ikke gjeninnføres", () => {
  const provider = fs.readFileSync(
    path.join(process.cwd(), "components/localization/language-provider.tsx"),
    "utf8",
  );
  for (const obsoleteMechanism of [
    "exactTranslations",
    "translateNorwegianText",
    "MutationObserver",
    "localizeElement",
    "originalAttributes",
  ]) {
    assert.doesNotMatch(provider, new RegExp(obsoleteMechanism));
  }
});

test("komponentene har ingen direkte språkgrener", () => {
  const roots = ["app", "application", "components", "features"];
  const files = roots.flatMap((root) => listSourceFiles(path.join(process.cwd(), root)));
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /language\s*===\s*["']en["']/, file);
  }
});

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(file);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}
