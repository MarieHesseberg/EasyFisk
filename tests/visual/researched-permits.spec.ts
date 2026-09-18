import { expect, test } from "@playwright/test";

test("ny delsone beholder pris, område og dato gjennom kjøp på mobil", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 2", exact: true }).click();
  await shop.getByLabel("Delsone eller salgsområde").selectOption("Holmesland B");
  await expect(shop.locator("article")).toHaveCount(1);
  await expect(shop.locator("article")).toContainText("375 kr");
  await shop.locator("article").getByRole("button", { name: "Kjøp fiskekort" }).click();
  await shop.getByText("Vilkår og produktinformasjon", { exact: true }).click();
  await expect(shop.getByText("Båt er inkludert i fiskekortet.", { exact: true })).toBeVisible();
  await shop.getByText("Vilkår og produktinformasjon", { exact: true }).click();
  await shop.locator(".permit-calendar-grid button:not([disabled])").first().click();
  await shop.screenshot({ path: testInfo.outputPath("holmesland-b.png") });
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await shop.getByLabel("Fullt navn").fill("Test Fisker");
  await shop.getByLabel("Fødselsdato").fill("1990-05-12");
  await shop.getByLabel("E-post").fill("fisker@example.no");
  await shop.getByLabel("Telefon").fill("98765432");
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await expect(shop.locator(".permit-order-summary")).toContainText("Sone 2 · Holmesland B");
  await shop.getByRole("button", { name: "Betal med Vipps", exact: true }).click();
  await shop.getByRole("button", { name: "Godkjenn 375 kr", exact: true }).click();
  await expect(shop.getByRole("status")).toContainText("Fiskekortet er lagret");
  await expect(shop.getByRole("status")).toContainText("Sone 2 · Holmesland B");
});

test("ny sone 4-delsone viser riktig sesong og oversettes til engelsk", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 4", exact: true }).click();
  await shop.getByLabel("Delsone eller salgsområde").selectOption("Bjåhylen");
  await shop.locator("article").getByRole("button").click();
  await expect(shop.getByRole("button", { name: "Neste måned", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(shop.getByRole("heading", { name: "Bjåhylen day permit" })).toBeVisible();
  await shop.getByText("Terms and product information", { exact: true }).click();
  await expect(
    shop.getByText("A calm river stretch with fishing from both banks.", { exact: true }),
  ).toBeVisible();
});
