import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to English" }).click();
});

test("PDF 1–2: notification contents and missing-document checks are English", async ({ page }) => {
  await page.getByRole("button", { name: "Notifications", exact: true }).click();
  const alerts = page.locator(".header-alert-panel");
  await expect(alerts).toContainText("Fishing permit sales have ended for 2026");
  await expect(alerts).toContainText("The example permit expires today at 17:59.");
  await expect(alerts).toContainText("The rules were updated on 1 August.");
  await page.getByRole("button", { name: "Close notifications" }).click();
  await page.getByRole("button", { name: "SEE WHAT IS MISSING" }).click();
  const flow = page.getByRole("dialog", { name: "Start fishing" });
  await expect(flow).toContainText("1 of 4");
  await expect(flow).toContainText("Cannot start");
  await expect(flow).toContainText("STATUS FROM YOUR DOCUMENTS");
  await expect(flow.getByRole("button", { name: "Find and buy a fishing permit" })).toBeVisible();
  await expect(flow).not.toContainText(/Mangler|Gyldig|Kvoter|Kan ikke|Avbryt|Sone 3/);
});

for (const zone of [1, 2, 3, 4]) {
  test(`PDF 7–15: map and every permit detail in zone ${zone} are English`, async ({ page }) => {
    await page.getByRole("button", { name: "Map", exact: true }).click();
    await page
      .locator(".map-zone-switcher")
      .getByRole("button", { name: `Zone ${zone}`, exact: true })
      .click();
    const sheet = page.locator(".zone-sheet");
    await expect(
      sheet.getByRole("heading", { name: new RegExp(`^Zone ${zone}`), level: 2 }),
    ).toBeVisible();
    await expect(sheet).toContainText("SEASON 2026");
    await expect(sheet).not.toContainText(
      /SESONG|Sone|fiskedøgn|døgnkort|simulert|offentliggjort|inkludert/,
    );
    await sheet.getByRole("button", { name: `View and choose permits in zone ${zone}` }).click();
    const shop = page.getByRole("dialog", { name: "Permits and purchases" });
    await expect(shop.locator(".permit-shop-list > article").first()).toBeVisible();
    const count = await shop.locator(".permit-shop-list > article").count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      await shop.locator(".permit-shop-list > article").nth(index).getByRole("button").click();
      const detail = shop.locator(".permit-product-detail");
      await expect(
        detail.getByRole("img", { name: `Guide map showing zone ${zone}` }),
      ).toBeVisible();
      await expect(detail).not.toContainText(
        /fiskedøgn|døgnkort|sesongkort|Simulert|Kapasitet|Inntil|Fangst|Gyldig|Registreringen|Datokalenderen|Fortsett|sesongen/,
      );
      await detail.getByRole("button", { name: "Back to permits" }).click();
    }
  });
}

test("English mobile home stays within the viewport and switches back to Norwegian", async ({
  page,
}, testInfo) => {
  await expect(page.getByRole("heading", { name: "Documents missing" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("english-home.png"), fullPage: true });
  await page.getByRole("button", { name: "Bytt til norsk" }).click();
  await expect(page.getByRole("heading", { name: "Dokumentasjon mangler" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "no");
});
