import assert from "node:assert/strict";
import test from "node:test";

import {
  technicalErrorMessages,
  technicalOperationFailed,
} from "../domain/shared/operation-result.ts";

test("technical failures expose a stable code and a localizable message key", () => {
  const cause = new Error("QuotaExceededError");
  const result = technicalOperationFailed("storage.write", cause);

  assert.deepEqual(result, {
    ok: false,
    code: "storage.write",
    error: "error.storage.write",
    cause,
  });
});

test("every technical error code maps to a semantic translation key", () => {
  assert.deepEqual(Object.keys(technicalErrorMessages).sort(), [
    "storage.blocked",
    "storage.clear",
    "storage.delete",
    "storage.invalid-data",
    "storage.read",
    "storage.write",
  ]);
  assert.ok(Object.values(technicalErrorMessages).every((message) => message.startsWith("error.")));
});

test("blocked browser storage is reported with the actionable blocked code", () => {
  const result = technicalOperationFailed(
    "storage.write",
    new Error("The database is blocked by another tab"),
  );

  assert.equal(result.code, "storage.blocked");
  assert.equal(result.error, "error.storage.blocked");
});
