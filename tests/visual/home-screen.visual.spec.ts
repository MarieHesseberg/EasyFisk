import { expect, test } from "@playwright/test";

const viewports = [
  { name: "iphone", width: 390, height: 844 },
  { name: "android", width: 412, height: 915 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`hjemskjermen beholder utseendet på ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
      animations: "disabled",
      fullPage: viewport.name !== "desktop",
      // Chromium rasteriserer skrifter litt forskjellig på Windows og Linux i CI.
      // Grensen tåler dette, men fanger fortsatt tydelige layout- og stilendringer.
      maxDiffPixelRatio: 0.08,
    });
  });
}

test("språkvalget følger brukeren mellom faner og etter refresh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { name: "Your fishing overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Documents missing" })).toBeVisible();
  await expect(
    page.getByText(
      "Register a valid fishing permit, valid disinfection, and the national fishing fee or an exemption before you start.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Not registered — add documentation").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Bytt til norsk" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Permits", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Permits", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Buy fishing permit" })).toBeVisible();
  await expect(page.getByText("Choose main zone")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Your fishing overview" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
