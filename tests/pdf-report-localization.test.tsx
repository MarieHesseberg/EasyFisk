import { expect, test } from "vitest";
import { prototypePermitProducts } from "../data/prototype/mandalselva-permit-products";
import { getPrototypePermitProductDetails } from "../data/prototype/mandalselva-permit-product-details";
import { ruleSections } from "../data/mock/rule-sections";
import { zones } from "../data/mock/fishing-zones";
import { mockAppContent } from "../data/mock/mock-app-content";
import { documentFields } from "../domain/documents/document-fields";
import { documentGuidance } from "../features/documents/document-guidance";
import { localizeDocumentError } from "../lib/localize-document-error";
import { localizeText } from "../domain/localization/localized-text";
import { getPrototypePermitAvailability } from "../domain/fishing-permits/get-prototype-permit-availability";
import { formatPrototypePermitPrice } from "../domain/fishing-permits/prototype-permit-product";
import { localizeSessionResult } from "../lib/localize-session-result";
import { translateContent } from "../locales";

function expectTranslated(value: string) {
  expect(translateContent("en", value), value).not.toBe(value);
  expect(translateContent("no", value), value).toBe(value);
}

test("PDF 7–15: every permit product and all four map zones have English content", () => {
  for (const product of prototypePermitProducts) {
    const details = getPrototypePermitProductDetails(product);
    for (const value of [
      product.title,
      product.note,
      product.capacity.label,
      product.validity.label,
      product.availability.label,
      details.ageRule,
      details.reportingRule,
      ...details.equipmentAndFacilities,
    ])
      expectTranslated(value);
  }
  for (const zone of zones) {
    for (const value of [
      zone.name,
      zone.status,
      zone.status.toUpperCase(),
      zone.desc,
      zone.note,
      zone.season,
    ])
      expectTranslated(value);
  }
});

test("PDF 16–24: every rule section and expanded paragraph has English content", () => {
  for (const section of ruleSections) {
    expectTranslated(section.title);
    for (const value of [section.summary, ...section.rules]) {
      expect(translateContent("en", localizeText(value, "en"))).not.toBe(localizeText(value, "no"));
    }
  }
});

test("PDF 1, 4–6, 11, 25–27: alerts, document fields, menus and report categories translate", () => {
  for (const alert of mockAppContent.headerAlerts) expectTranslated(alert.message);
  for (const item of mockAppContent.profile.menuItems) {
    expectTranslated(item.title);
    expectTranslated(item.description);
  }
  for (const fields of Object.values(documentFields)) {
    for (const field of fields) {
      expectTranslated(field.label);
      for (const option of field.options ?? []) expectTranslated(option);
    }
  }
  for (const guidance of Object.values(documentGuidance)) {
    expectTranslated(guidance.text);
    expectTranslated(guidance.link);
  }
  for (const category of mockAppContent.feedback.categories) expectTranslated(category);
  for (const option of mockAppContent.profile.notificationOptions) {
    expectTranslated(option.label);
    expectTranslated(option.description);
  }
});

test("document validation translates dynamic field errors", () => {
  expect(localizeDocumentError("Fyll ut navn på fiskeren.", "en")).toBe("Fill in angler's name.");
  expect(localizeDocumentError("Utsteder / selger er for langt (maks 500 tegn).", "en")).toBe(
    "Issuer / seller is too long (maximum 500 characters).",
  );
  expect(localizeDocumentError("Sluttid må være etter starttid.", "en")).toBe(
    "The end time must be after the start time.",
  );
});

test("calendar states and prices translate without changing availability", () => {
  for (const product of prototypePermitProducts) {
    for (const date of [
      "invalid",
      "2026-05-01",
      "2026-10-01",
      "2027-06-01",
      ...Array.from({ length: 30 }, (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`),
    ]) {
      const no = getPrototypePermitAvailability(product, date);
      const en = getPrototypePermitAvailability(product, date, "en");
      expect(en.status).toBe(no.status);
      expect(en.remainingUnits).toBe(no.remainingUnits);
      expect(en.label).not.toBe(no.label);
    }
    expect(formatPrototypePermitPrice(product, "en")).not.toMatch(/simulert|Gratis|offentliggjort/);
  }
});

test("stored history translates counts without modifying user text", () => {
  expect(localizeSessionResult("2 fangster · etterregistrert", "en")).toBe(
    "2 catches · registered later",
  );
  expect(localizeSessionResult("Nullfangst · etterregistrert", "en")).toBe(
    "No catch · registered later",
  );
  expect(localizeSessionResult("2 fangster · etterregistrert", "no")).toBe(
    "2 fangster · etterregistrert",
  );
  expect(translateContent("en", "My note: fiskekort and Sone 3")).toBe(
    "My note: fiskekort and Sone 3",
  );
});
