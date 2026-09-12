import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}

test("the language provider does not rewrite rendered DOM text", () => {
  const provider = fs.readFileSync(
    path.join(root, "components/localization/language-provider.tsx"),
    "utf8",
  );

  assert.doesNotMatch(provider, /exactTranslations|translateNorwegianText|localizeElement/);
  assert.doesNotMatch(provider, /MutationObserver|createTreeWalker|SHOW_TEXT/);
  assert.doesNotMatch(provider, /\.replace\(\s*\/\^Sone/);
});

test("components do not select English with inline language branches", () => {
  const source = ["app", "application", "components", "features"]
    .flatMap((directory) => sourceFiles(path.join(root, directory)))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(source, /language\s*===\s*["']en["']/);
  assert.doesNotMatch(source, /["']en["']\s*===\s*language/);
});
