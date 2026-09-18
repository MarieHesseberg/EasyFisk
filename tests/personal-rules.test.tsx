import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { permitCatalogRepository } from "../data/repositories/permit-catalog";
import { createTestPermitDocument } from "../features/fishing-permits/create-test-permit-document";
import { RulesScreen } from "../features/rules/rules-screen";
import { getPersonalPermitContext } from "../domain/fishing-rules/get-personal-permit-context";
const now = Date.parse("2026-08-20T18:05:00+02:00");
const products = permitCatalogRepository.listProducts();
afterEach(cleanup);
function permit(id: string) {
  return createTestPermitDocument(permitCatalogRepository.findProduct(id)!, "2026-08-20", now);
}
for (const [id, end] of [
  ["zone-4-bjahylen-day", "2026-08-31"],
  ["zone-4-nodehylen-day", "2026-08-31"],
  ["zone-4-laksehylen-day", "2026-09-15"],
]) {
  test(`${id} resolves its own season regardless of the selected map zone`, () => {
    const doc = permit(id);
    expect(getPersonalPermitContext(doc, products)?.seasonEnd).toBe(end);
    render(
      <RulesScreen
        demoStatus="ok"
        selectedZone={1}
        documents={[doc]}
        now={now}
        onRegisterPermit={() => {}}
      />,
    );
    expect(screen.getByRole("heading", { name: /Regler for Sone 4/ })).toBeTruthy();
    expect(document.querySelector(".personal-rule-list")?.textContent).toContain(
      end === "2026-08-31" ? "1. juni–31. august" : "1. juni–15. september",
    );
  });
}
test("local restrictions stay visible while optional information and sources are collapsed", () => {
  render(
    <RulesScreen
      demoStatus="ok"
      documents={[permit("zone-4-laksehylen-day")]}
      now={now}
      onRegisterPermit={() => {}}
    />,
  );
  expect(document.querySelector(".personal-local-rules")?.textContent).toContain(
    "Fiskeforbud 50 meter",
  );
  expect((document.querySelector(".personal-rule-details") as HTMLDetailsElement).open).toBe(false);
  expect((document.querySelector(".rule-updates") as HTMLDetailsElement).open).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: /Sesongkvoter/ }));
  expect(document.querySelector(".rule-body")?.textContent).toContain("5 avlivede laks");
});
test("missing permit stays generic and an ended local season remains a visible alert", () => {
  const view = render(
    <RulesScreen demoStatus="noPermit" documents={[]} now={now} onRegisterPermit={() => {}} />,
  );
  expect(screen.getByRole("heading", { name: "Spesifikke regler for din sone" })).toBeTruthy();
  view.rerender(
    <RulesScreen
      demoStatus="ok"
      documents={[permit("zone-4-bjahylen-day")]}
      now={Date.parse("2026-09-01T12:00:00Z")}
      onRegisterPermit={() => {}}
    />,
  );
  expect(screen.getByRole("alert").textContent).toContain("Fiskesesongen er avsluttet");
});
