import { expect, test } from "vitest";
import { getDisplayedPermit, isPermitValid } from "../domain/documents/get-permit-zones";
import { getDocumentReadiness } from "../domain/documents/get-document-readiness";
import type { FishingDocument } from "../domain/documents/fishing-document";

const permit = (
  zone: number,
  startsAt: string,
  endsAt: string,
  updatedAt: number,
): FishingDocument => ({
  id: `permit-${zone}-${updatedAt}`,
  kind: "permit",
  updatedAt,
  values: { area: `Mandalselva · Sone ${zone}`, startsAt, endsAt },
});

test("owned upcoming and expired permits are displayed without granting readiness", () => {
  const now = Date.parse("2026-07-10T12:00:00");
  const upcoming = permit(2, "2026-07-15T18:00", "2026-07-16T17:59", 2);
  const expired = permit(4, "2026-07-01T18:00", "2026-07-02T17:59", 1);
  for (const document of [upcoming, expired]) {
    expect(getDisplayedPermit([document], now, 3)).toBe(document);
    expect(isPermitValid(document, now)).toBe(false);
    expect(getDocumentReadiness([document], now).valid.permit).toBe(false);
  }
  expect(getDisplayedPermit([expired, upcoming], now, 4)).toBe(upcoming);
});

test("current permits take priority and deleting the last permit clears the display", () => {
  const now = Date.parse("2026-07-10T12:00:00");
  const active = permit(2, "2026-07-10T00:00", "2026-07-10T23:59", 1);
  const expired = permit(4, "2026-07-01T00:00", "2026-07-01T23:59", 2);
  expect(getDisplayedPermit([expired, active], now, 4)).toBe(active);
  expect(getDisplayedPermit([], now, 2)).toBeUndefined();
});
