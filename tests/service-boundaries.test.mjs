import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
      return entry.isDirectory() ? sourceFiles(url) : entry.name.endsWith(".ts") ? [url] : [];
    }),
  );
  return groups.flat();
}

test("domain calculations do not access browser storage", async () => {
  for (const file of await sourceFiles(new URL("../domain/", import.meta.url))) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      /\b(?:localStorage|sessionStorage|indexedDB)\b|\bwindow\./,
      file.pathname,
    );
  }
});

test("replaceable I/O consumers never construct browser adapters", async () => {
  const paths = [
    "features/documents/use-documents.ts",
    "features/fishing-permits/use-permit-checkout-controller.ts",
    "features/fishing-permits/use-permit-purchases.ts",
    "features/fishing-permits/use-permit-reporting-days.ts",
    "features/profile/hooks/use-preferences-controller.ts",
  ];
  for (const path of paths) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /from ["'].*data\/(?:local-storage|indexed-db)\//, path);
    assert.doesNotMatch(source, /\b(?:localStorage|indexedDB)\b/, path);
  }
});

test("publishing includes browser checks before the build is uploaded", async () => {
  const source = await readFile(
    new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );
  assert.match(source, /npm run test:visual/);
  assert.ok(source.indexOf("npm run test:visual") < source.indexOf("upload-pages-artifact"));
});
