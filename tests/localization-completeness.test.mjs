import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

import { locales } from "../locales/index.ts";

const root = process.cwd();
const uiFiles = ["app", "application", "components", "features"].flatMap((directory) =>
  listSourceFiles(path.join(root, directory)),
);
const commonNorwegian =
  /\b(?:og|ikke|velg|registrer|fiskekort|døgnkort|sesongkort|fangst|tilbake|mangler|gyldig|utløpt|lagre|slett|dokumentasjon)\b/i;

test("every locale contains exactly the same translation keys", () => {
  assert.deepEqual(Object.keys(locales.en).sort(), Object.keys(locales.no).sort());
});

test("every literal t() key used by the UI exists in both locales", () => {
  const violations = [];
  for (const file of uiFiles) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/\bt\(\s*["']([^"']+)["']/g)) {
      if (!(match[1] in locales.no) || !(match[1] in locales.en))
        violations.push(`${relative(file)}: ${match[1]}`);
    }
  }
  assert.deepEqual(violations, []);
});

test("JSX has no unapproved visible string literals", () => {
  const violations = [];
  for (const file of uiFiles.filter((candidate) => candidate.endsWith(".tsx"))) {
    const source = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    visit(sourceFile, (node) => {
      if (ts.isJsxText(node))
        recordLiteral(node.getText(sourceFile), file, node, sourceFile, violations);
      if (
        ts.isJsxAttribute(node) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer) &&
        ["aria-label", "placeholder", "title", "alt"].includes(node.name.getText(sourceFile))
      ) {
        recordLiteral(node.initializer.text, file, node, sourceFile, violations);
      }
    });
  }
  assert.deepEqual(violations, []);
});

test("English catalogue text does not contain common Norwegian UI words", () => {
  const violations = Object.entries(locales.en)
    .filter(([, value]) => commonNorwegian.test(value))
    .map(([key, value]) => `${key}: ${value}`);
  assert.deepEqual(violations, []);
});

test("product and rule display fields cross the localization boundary", () => {
  const patterns = [
    />\s*\{\s*product\.(?:title|areaName|note)\s*\}/,
    />\s*\{\s*product\.(?:validity|capacity|availability)\.label\s*\}/,
    />\s*\{\s*(?:section|item)\.(?:title|summary)\s*\}/,
    />\s*\{\s*rule\s*\}/,
  ];
  const violations = [];
  for (const file of uiFiles) {
    const source = fs.readFileSync(file, "utf8");
    for (const pattern of patterns) if (pattern.test(source)) violations.push(relative(file));
  }
  assert.deepEqual([...new Set(violations)], []);
});

test("errors, empty states and accessibility labels use translation keys", () => {
  const violations = [];
  for (const file of uiFiles.filter((candidate) => candidate.endsWith(".tsx"))) {
    const source = fs.readFileSync(file, "utf8");
    const forbidden = [
      /aria-label=["'][A-Za-zÆØÅæøå]/,
      /placeholder=["'](?!(?:cm|kg)["'])[A-Za-zÆØÅæøå]/,
      />\s*(?:Ingen|Kunne ikke|Mangler|Feil)[^<{]*</,
    ];
    if (forbidden.some((pattern) => pattern.test(source))) violations.push(relative(file));
  }
  assert.deepEqual(violations, []);
});

function recordLiteral(value, file, node, sourceFile, violations) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized || !/[A-Za-zÆØÅæøå]/.test(normalized) || isApprovedLiteral(normalized)) return;
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  violations.push(`${relative(file)}:${line + 1}: ${normalized}`);
}

function isApprovedLiteral(value) {
  return /^(?:easyfisk|Mandalselva|cm\s*·?|kg\s*·?|kr|SESONG|NB|GPS|NOK|Inatur|Cloudflare|EasyFisk ·|Mandalselva Elveeigarlag ·|Lovdata ·|Statsforvalteren i Agder ·)$/i.test(
    value,
  );
}

function visit(node, callback) {
  callback(node);
  node.forEachChild((child) => visit(child, callback));
}

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(file);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}
