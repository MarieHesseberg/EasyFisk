import assert from "node:assert/strict";
import test from "node:test";

import { mockAppContentRepository } from "../data/mock/mock-app-content-repository.ts";

test("appinnhold leveres gjennom en typet og beskyttet repository-kontrakt", () => {
  const first = mockAppContentRepository.getContent();
  const second = mockAppContentRepository.getContent();

  assert.equal(first.profile.fisherId, "10482");
  assert.equal(first.statistics.zoneCatchTotals.length, 4);
  assert.notEqual(first, second);
  assert.notEqual(first.profile, second.profile);
});
