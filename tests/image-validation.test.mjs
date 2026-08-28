import assert from "node:assert/strict";
import test from "node:test";
import { maximumImageBytes, validateImage } from "../domain/images/validate-image.ts";

test("bildevalidering avviser feil filtype og for store bilder", () => {
  assert.equal(validateImage({ type: "application/pdf", size: 100 }).ok, false);
  assert.equal(validateImage({ type: "image/jpeg", size: maximumImageBytes + 1 }).ok, false);
  assert.equal(validateImage({ type: "image/png", size: maximumImageBytes }).ok, true);
});
