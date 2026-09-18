import { expect, test } from "@playwright/test";

test("Vipps can be cancelled and completed without secure-context randomUUID", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 3", exact: true }).click();
  await shop.locator("article").filter({ hasText: "Sone 3 døgnkort" }).getByRole("button").click();
  await shop.getByRole("button", { name: /20\. august 2026/ }).click();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await shop.getByLabel("Fullt navn").fill("Test Fisker");
  await shop.getByLabel("Fødselsdato").fill("1990-05-12");
  await shop.getByLabel("E-post").fill("fisker@example.no");
  await shop.getByLabel("Telefon").fill("98765432");
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await expect(shop.getByRole("heading", { name: "Godkjenn betaling" })).toBeVisible();
  await expect(shop.getByText("Ingen penger trekkes.", { exact: true })).toBeVisible();
  await shop.getByRole("button", { name: "Avbryt betaling" }).click();
  await expect(shop.getByRole("alert")).toContainText("Betalingen ble avbrutt");
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("Test Fisker");
  await expect(shop.getByLabel(/Jeg godtar vilkårene/)).toBeChecked();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await page.screenshot({ path: testInfo.outputPath("vipps-approval.png") });
  await shop.getByRole("button", { name: "Godkjenn 455 kr" }).click();
  await expect(shop.getByRole("heading", { name: "Betaling godkjent" })).toBeVisible();
  await expect(shop.getByRole("status")).toContainText("Fiskekortet er lagret");
  await page.screenshot({ path: testInfo.outputPath("payment-confirmation.png") });
  await shop.getByRole("button", { name: "Åpne fiskekort" }).click();
  await expect(page.getByRole("heading", { name: "Mine fiskekort", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("button", { name: /Fiskekort (kjøpt|registrert)/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Regler", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Regler for Sone 3/ })).toBeVisible();
  await expect(page.getByText(/Vi mangler fiskekortet ditt/)).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine fiskekort/ }).click();
  await expect(page.getByText(/Test Fisker/).first()).toBeVisible();
});
