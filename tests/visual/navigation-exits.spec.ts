import { appClockStart } from "../../data/prototype/demo-clock";
import { expect, test, type Page } from "@playwright/test";

const tabs = ["Hjem", "Kart", "Fiskekort", "Regler", "Mer"];
async function tab(page: Page, name: string) {
  await page.locator(".bottom-nav").getByRole("button", { name, exact: true }).click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  await expect(
    page.locator(".bottom-nav").getByRole("button", { name, exact: true }),
  ).toHaveAttribute("aria-current", "page");
}

test.use({ viewport: { width: 390, height: 664 } });

for (const destination of tabs) {
  test(`global document page can navigate directly to ${destination}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await tab(page, destination);
    await tab(page, "Hjem");
  });
}

test("every More menu detail closes and same-tab navigation dismisses it", async ({ page }) => {
  await page.goto("/");
  await tab(page, "Mer");
  const count = await page.locator(".menu-list > button").count();
  for (let i = 0; i < count; i++) {
    await page.locator(".menu-list > button").nth(i).click();
    if (await page.locator('[role="dialog"]').count()) {
      await page
        .locator('[role="dialog"]')
        .getByRole("button", { name: /Tilbake/ })
        .first()
        .click();
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);
      await page.locator(".menu-list > button").nth(i).click();
    }
    await tab(page, "Mer");
  }
});

test("past trip close, keyboard exit and bottom navigation work", async ({ page }) => {
  await page.goto("/");
  for (const exit of ["close", "keyboard", "navigation"]) {
    await page.getByRole("button", { name: /Registrer tidligere fisketur/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    if (exit === "close") await dialog.getByRole("button", { name: "Lukk registrering" }).click();
    if (exit === "keyboard") await page.keyboard.press("Escape");
    if (exit === "navigation") await tab(page, "Kart");
    await expect(dialog).toHaveCount(0);
    await tab(page, "Hjem");
  }
});

test("catch close works at every step and navigation keeps the active trip", async ({ page }) => {
  await page.addInitScript(
    (now) =>
      localStorage.setItem(
        "easyfisk:fishing-log:v1",
        JSON.stringify({
          version: 2,
          activeSession: { startTime: now - 60000, zone: 3 },
          sessions: [],
          catches: [],
        }),
      ),
    appClockStart,
  );
  await page.goto("/");
  for (const step of [1, 2, 3]) {
    await page.getByRole("button", { name: "Registrer fangst", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
    if (step >= 3) {
      await dialog.getByPlaceholder("cm").fill("65");
      await dialog.getByPlaceholder("kg").fill("3");
    }
    await dialog.getByRole("button", { name: "Lukk fangstrapport" }).click();
    await expect(dialog).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Registrer fangst", exact: true }).click();
  await tab(page, "Regler");
  await tab(page, "Hjem");
  await expect(page.locator(".home-active-trip")).toBeVisible();
  await page.getByRole("button", { name: "Avslutt fisketuren", exact: true }).click();
  await page.getByRole("button", { name: "Lukk", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Avslutt fisketuren", exact: true }).click();
  await tab(page, "Kart");
  await tab(page, "Hjem");
  await expect(page.locator(".home-active-trip")).toBeVisible();
});

test("missing catch before finish can be dismissed without ending the trip", async ({ page }) => {
  await page.addInitScript(
    (now) =>
      localStorage.setItem(
        "easyfisk:fishing-log:v1",
        JSON.stringify({
          version: 2,
          activeSession: { startTime: now - 60000, zone: 3 },
          sessions: [],
          catches: [],
        }),
      ),
    appClockStart,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Avslutt fisketuren", exact: true }).click();
  await page.getByRole("button", { name: "Registrer manglende fangst", exact: true }).click();
  await page.getByRole("button", { name: "Lukk fangstrapport" }).click();
  await expect(page.getByRole("dialog", { name: "Avslutt økt" })).toBeVisible();
  await page.getByRole("button", { name: "Registrer manglende fangst", exact: true }).click();
  await tab(page, "Hjem");
  await expect(page.locator(".home-active-trip")).toBeVisible();
  await page.reload();
  await expect(page.locator(".home-active-trip")).toBeVisible();
});

test("map and notification close buttons respond to actual clicks", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Varsler", exact: true }).click();
  await page.getByRole("button", { name: "Lukk varsler" }).click();
  await expect(page.locator(".header-alert-panel")).toHaveCount(0);
  await tab(page, "Kart");
  // Vent på Leaflets klikkbare soner, ikke bare Reacts tomme kartbeholder.
  await expect(page.locator(".leaflet-map-canvas .leaflet-interactive")).toHaveCount(4);
  await page.getByRole("button", { name: "Sone 2", exact: true }).click();
  await page.locator(".leaflet-map-canvas").click({ position: { x: 20, y: 30 } });
  await expect(page.locator(".map-zone-popup")).toHaveCount(0);
});
