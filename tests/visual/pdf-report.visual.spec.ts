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
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .locator(".map-zone-switcher")
    .getByRole("button", { name: "Zone 3", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Use zone 3 for the fishing session" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "View and choose permits in zone 3" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Get ready to fish" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Buy fishing permit", exact: true })).toBeVisible();
});

for (const zone of [1, 2, 3, 4]) {
  test(`PDF 7–15: map and every permit detail in zone ${zone} are English`, async ({ page }) => {
    await page.getByRole("button", { name: "Map", exact: true }).click();
    await page
      .locator(".map-zone-switcher")
      .getByRole("button", { name: `Zone ${zone}`, exact: true })
      .click();
    const sheet = page.locator(".map-zone-popup");
    await expect(
      sheet.getByRole("heading", { name: new RegExp(`^Zone ${zone}`), level: 2 }),
    ).toBeVisible();
    await expect(sheet).not.toContainText(
      /SESONG|Sone|fiskedøgn|døgnkort|simulert|offentliggjort|inkludert/,
    );
    await sheet.getByRole("button", { name: `View and choose permits in zone ${zone}` }).click();
    const shop = page.locator(".permit-shop-screen");
    await expect(shop.locator(".permit-shop-list > article").first()).toBeVisible();
    const count = await shop.locator(".permit-shop-list > article").count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      await shop.locator(".permit-shop-list > article").nth(index).getByRole("button").click();
      const detail = shop.locator(".permit-product-detail");
      await expect(detail).toContainText(`Zone ${zone}`);
      await detail.getByText("Terms and product information", { exact: true }).click();
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
  await expect(page.getByRole("heading", { name: "Get ready to fish" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("english-home.png"), fullPage: true });
  await page.getByRole("button", { name: "Bytt til norsk" }).click();
  await expect(page.getByRole("heading", { name: "Gjør deg klar til å fiske" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "no");
});
