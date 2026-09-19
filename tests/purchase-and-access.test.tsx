import { afterEach, expect, test } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { usePermitCheckoutController } from "../features/fishing-permits/use-permit-checkout-controller";
import { prototypePermitProducts } from "../data/prototype/mandalselva-permit-products";
import {
  emptyPermitCheckoutForm,
  getPermitPriceSummary,
  type PermitPurchase,
} from "../domain/fishing-permits/permit-purchase";
import { getPrototypePermitAvailability } from "../domain/fishing-permits/get-prototype-permit-availability";
import { getDocumentReadiness } from "../domain/documents/get-document-readiness";
import { validateAccessGrant, documentsForLocalProfile } from "../domain/documents/access-grants";
import {
  acceptCurrentRules,
  hasAcceptedCurrentRules,
  hasPreviousRuleAcceptance,
  readRuleAcceptances,
  ruleVersions,
  currentRuleVersion,
} from "../application/rules/rule-acceptance";
import { operationSucceeded } from "../domain/shared/operation-result";
import type { FishingDocument, AccessGrant } from "../domain/documents/fishing-document";

const product = prototypePermitProducts.find((p) => p.id === "zone-3-day")!;
const buyer = {
  fullName: "Kari Nordmann",
  birthDate: "1990-01-01",
  email: "kari@example.no",
  phone: "12345678",
};
const form = {
  ...emptyPermitCheckoutForm,
  ...buyer,
  acceptsRules: true,
  acceptsTerms: true,
  fishingDates: ["2026-08-20", "2026-08-22", "2026-08-22"],
};
afterEach(() => {
  cleanup();
  localStorage.clear();
});

test("separate dates issue separate permits in one order and charge each unique date once", async () => {
  const documents: FishingDocument[] = [];
  const purchases: PermitPurchase[] = [];
  const { result } = renderHook(() =>
    usePermitCheckoutController({
      product,
      initialSelectedDate: "2026-08-20",
      initialForm: form,
      paymentOutcome: "approved",
      save: async () => operationSucceeded(undefined),
      saveMany: async (items) => {
        documents.push(...items);
        return operationSucceeded(undefined);
      },
      savePurchase: (p) => {
        purchases.push(p);
        return operationSucceeded(undefined);
      },
    }),
  );
  await act(async () => {
    await result.current.submit();
  });
  expect(documents).toHaveLength(2);
  expect(new Set(documents.map((d) => d.id)).size).toBe(2);
  expect(purchases.at(-1)?.fishingDates).toEqual(["2026-08-20", "2026-08-22"]);
  expect(purchases.at(-1)?.priceNok).toBe(product.price.amountNok! * 2);
  expect(purchases.at(-1)?.documentIds).toHaveLength(2);
  expect(getDocumentReadiness(documents, Date.parse("2026-08-21T12:00:00"), 3).valid.permit).toBe(
    false,
  );
  expect(getDocumentReadiness(documents, Date.parse("2026-08-22T12:00:00"), 3).valid.permit).toBe(
    true,
  );
});

test("an invalid extra date prevents the entire order", async () => {
  let issued = 0;
  const { result } = renderHook(() =>
    usePermitCheckoutController({
      product,
      initialSelectedDate: "2026-08-20",
      initialForm: { ...form, fishingDates: ["2026-12-01"] },
      paymentOutcome: "approved",
      save: async () => {
        issued++;
        return operationSucceeded(undefined);
      },
      savePurchase: () => operationSucceeded(undefined),
    }),
  );
  await act(async () => {
    await result.current.submit();
  });
  expect(issued).toBe(0);
  expect(result.current.error).toContain("2026-12-01");
});

test("buying for another angler retains the buyer and does not grant the buyer fishing rights", async () => {
  const documents: FishingDocument[] = [];
  const fisher = { ...buyer, fullName: "Ola Nordmann", email: "ola@example.no" };
  const { result } = renderHook(() =>
    usePermitCheckoutController({
      product,
      initialSelectedDate: "2026-08-20",
      initialForm: { ...form, buyForOther: true, fisher },
      paymentOutcome: "approved",
      save: async (d) => {
        documents.push(d);
        return operationSucceeded(undefined);
      },
      savePurchase: () => operationSucceeded(undefined),
    }),
  );
  await act(async () => {
    await result.current.submit();
  });
  expect(result.current.receipt?.purchase.buyer.fullName).toBe(buyer.fullName);
  expect(documents[0].values.holder).toBe(fisher.fullName);
  expect(getDocumentReadiness(documents, Date.parse("2026-08-20T20:00:00"), 3).valid.permit).toBe(
    false,
  );
});

test("unlimited sales remain available across dates and local restrictions are independent", () => {
  for (let day = 20; day <= 25; day++)
    expect(
      getPrototypePermitAvailability(
        { ...product, capacity: { label: "Unlimited" } },
        `2026-08-${day}`,
      ).status,
    ).toBe("available");
  const restricted = {
    ...product,
    validity: { ...product.validity, excludedDates: ["2026-08-22"], allowedWeekdays: [4, 5] },
  };
  expect(getPrototypePermitAvailability(restricted, "2026-08-22").status).toBe("no-fishing-date");
  expect(getPrototypePermitAvailability(restricted, "2026-08-23").status).toBe("no-fishing-date");
  expect(getPermitPriceSummary(product, form).permitQuantity).toBe(2);
});

test("rule acceptance is versioned, persistent, idempotent and scoped to the profile", () => {
  localStorage.setItem("easyfisk-profile-v1", JSON.stringify(buyer));
  localStorage.setItem(
    "easyfisk-rule-acceptances-v1",
    JSON.stringify([{ person: buyer.email, version: "previous-version-test", acceptedAt: 1 }]),
  );
  expect(hasPreviousRuleAcceptance()).toBe(true);
  expect(hasAcceptedCurrentRules()).toBe(false);
  acceptCurrentRules();
  acceptCurrentRules();
  expect(readRuleAcceptances()).toHaveLength(2);
  expect(hasAcceptedCurrentRules()).toBe(true);
  expect(ruleVersions[currentRuleVersion].metadata.versionDate).toBe("2026-08-01");
  localStorage.setItem(
    "easyfisk-profile-v1",
    JSON.stringify({ ...buyer, email: "someone@example.no" }),
  );
  expect(hasAcceptedCurrentRules()).toBe(false);
});

const parent: FishingDocument = {
  id: "owner-card",
  kind: "permit",
  updatedAt: 1,
  ownerEmail: buyer.email,
  values: {
    holder: buyer.fullName,
    category: "Grunneierkort",
    issuer: "Local test",
    area: "Mandalselva · Sone 3",
    startsAt: "2026-08-01T00:00",
    endsAt: "2026-08-31T23:59",
  },
};
const grant: AccessGrant = {
  id: "guest",
  recipientName: "Ola Nordmann",
  recipientEmail: "ola@example.no",
  role: "guest",
  startsAt: "2026-08-20T00:00",
  endsAt: "2026-08-22T23:59",
  createdAt: 1,
};
test("guest access is restricted to owner, recipient, dates and parent; warden access cannot fish", () => {
  expect(validateAccessGrant(parent, grant, buyer.email)).toBeUndefined();
  expect(validateAccessGrant(parent, grant, "stranger@example.no")).toBeTruthy();
  expect(
    validateAccessGrant(parent, { ...grant, endsAt: "2026-09-01T00:00" }, buyer.email),
  ).toBeTruthy();
  const now = Date.parse("2026-08-21T12:00:00");
  const rights = (g: AccessGrant, at = now) =>
    getDocumentReadiness(
      documentsForLocalProfile([{ ...parent, accessGrants: [g] }], grant.recipientEmail, at),
      at,
      3,
    ).valid.permit;
  expect(rights(grant)).toBe(true);
  expect(rights({ ...grant, role: "warden" })).toBe(false);
  expect(rights({ ...grant, revokedAt: 2 })).toBe(false);
  expect(rights(grant, Date.parse("2026-08-23T12:00:00"))).toBe(false);
});
