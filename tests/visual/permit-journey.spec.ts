import { expect, test } from "@playwright/test";

test("kartet åpner kjøp først ved sonevalg; sone, dato og kladd følger hele kjøpet", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await expect(page.locator(".permit-shop-list, .zone-sheet, .map-zone-popup")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Kjøp fiskekort i sone/ })).toHaveCount(0);
  await page.locator(".phone-app").screenshot({ path: testInfo.outputPath("map.png") });
  await page
    .locator(".map-zone-switcher")
    .getByRole("button", { name: "Sone 2", exact: true })
    .click();
  await page.getByRole("button", { name: "Kjøp fiskekort i sone 2" }).click();
  const shop = page.locator(".permit-shop-screen");
  await expect(shop.getByRole("button", { name: "Sone 2", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await shop.getByLabel("Delsone eller salgsområde").selectOption("Holmegård");
  await shop
    .locator("article")
    .filter({ hasText: "Holmegård dagskort" })
    .getByRole("button")
    .click();
  await shop.getByRole("button", { name: /20\. august 2026/ }).click();
  await shop.screenshot({ path: testInfo.outputPath("product.png") });
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await shop.getByLabel("Fullt navn").fill("Marie Hesseberg");
  await shop.getByLabel("Fødselsdato").fill("1990-05-12");
  await shop.getByLabel("E-post").fill("marie@example.no");
  await shop.getByLabel("Telefon").fill("98765432");
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: /Tilbake til fiskekort/ }).click();
  await shop.getByRole("button", { name: /21\. august 2026/ }).click();
  await shop.getByRole("button", { name: /Tilbake til fiskekort/ }).click();
  await shop
    .locator("article")
    .filter({ hasText: "Holmegård dagskort" })
    .getByRole("button")
    .click();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("Marie Hesseberg");
  await expect(shop.locator(".permit-checkout-date-summary")).toContainText("21.08.2026");
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(shop.getByLabel("E-post")).toHaveValue("marie@example.no");
  await expect(shop.getByLabel(/Jeg godtar vilkårene/)).toBeChecked();
  await shop.getByRole("button", { name: "Neste · kontroller" }).click();
  await expect(shop.locator(".permit-checkout-progress li")).toHaveCount(3);
  await expect(shop.locator(".permit-order-summary")).toContainText("Sone 2 · Holmegård");
  await expect(shop.locator(".permit-order-summary")).toContainText("2026-08-21");
  await shop.screenshot({ path: testInfo.outputPath("review.png") });
  await shop.getByRole("button", { name: "Tilbake og endre" }).click();
  await expect(shop.getByLabel("Telefon")).toHaveValue("98765432");
  await shop.getByRole("button", { name: "Neste · kontroller" }).click();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await shop.getByRole("button", { name: /^Godkjenn \d+ kr$/ }).click();
  await expect(shop.getByRole("status")).toContainText("Fiskekortet er lagret");
  await expect(shop.getByRole("status")).toContainText("2026-08-21");
  await expect(shop.getByRole("status")).toContainText("Sone 2 · Holmegård");
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(shop.getByRole("status")).toContainText("Fiskekortet er lagret");
});
