import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 664 } });

async function openStart(page: Page, scenario = "ok") {
  await page.goto("/");
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  const settings = page.getByRole("dialog", { name: "Statusmotor" });
  await settings.getByLabel("Situasjon").selectOption(scenario);
  await settings.getByRole("button", { name: /bruk valgt situasjon/i }).click();
  await page.locator(".status-card button").click();
  const dialog = page.getByRole("dialog", { name: "Start fiske" });
  await expect(dialog.getByRole("heading", { name: "Finn riktig fiskesone" })).toBeVisible();
  await expect(dialog.getByRole("checkbox")).toHaveCount(0);
  await expect(dialog).not.toContainText("1 av 4");
  return dialog;
}

test("inside-zone test suggests zone and starts without other confirmation screens", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const dialog = await openStart(page, "zoneInside");
  await page.screenshot({ path: "tmp/pdfs/preview/start-single-page.png" });
  await dialog.getByRole("button", { name: "Tillat og finn sone" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Posisjonsforslag: Sone 3");
  const start = dialog.getByRole("button", { name: "Start fiske i Sone 3" });
  await expect(start).toBeInViewport();
  await page.screenshot({ path: "tmp/pdfs/preview/start-zone-found.png" });
  await start.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".active-session")).toContainText("Sone 3");
  expect(errors).toEqual([]);
});

test("outside-zone test warns and requires a manual selection on the same page", async ({
  page,
}) => {
  const dialog = await openStart(page, "zoneOutside");
  await dialog.getByRole("button", { name: "Tillat og finn sone" }).click();
  await expect(dialog.getByRole("alert")).toContainText("utenfor de registrerte fiskesonene");
  await expect(dialog.getByLabel("Hovedsone")).toHaveValue("");
  await expect(dialog.getByRole("button", { name: "Start fiske", exact: true })).toBeDisabled();
  await page.screenshot({ path: "tmp/pdfs/preview/start-outside-zone.png" });
  await dialog.getByLabel("Hovedsone").selectOption("3");
  await dialog.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect(page.locator(".active-session")).toContainText("Sone 3");
});

for (const code of [1, 2, 3]) {
  test(`GPS error ${code} offers manual selection without leaving start`, async ({ page }) => {
    await page.addInitScript((code) => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
            error({
              code,
              message: "test",
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            }),
        },
      });
    }, code);
    const dialog = await openStart(page);
    await dialog.getByRole("button", { name: "Tillat og finn sone" }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await dialog.getByLabel("Hovedsone").selectOption("3");
    await dialog.getByRole("button", { name: "Start fiske i Sone 3" }).click();
    await expect(page.locator(".active-session")).toContainText("Sone 3");
  });
}

test("real GPS suggestion outside permit coverage cannot start a trip", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 58.38, longitude: 7.53 },
          } as GeolocationPosition),
      },
    });
  });
  const dialog = await openStart(page);
  await dialog.getByRole("button", { name: "Tillat og finn sone" }).click();
  await expect(dialog.getByLabel("Hovedsone")).toHaveValue("4");
  await expect(dialog.getByRole("alert")).toContainText("gjelder ikke Sone 4");
  await dialog.getByLabel("Delsone").selectOption("Bjåhylen");
  await expect(dialog.getByRole("button", { name: "Start fiske i Sone 4" })).toBeDisabled();
  await dialog.getByLabel("Hovedsone").selectOption("3");
  await dialog.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect(page.locator(".active-session")).toContainText("Sone 3");
});

test("switching to manual selection ignores a late GPS response", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          (window as unknown as { resolvePosition: () => void }).resolvePosition = () =>
            success({
              coords: { latitude: 58.38, longitude: 7.53 },
            } as GeolocationPosition);
        },
      },
    });
  });
  const dialog = await openStart(page);
  await dialog.getByRole("button", { name: "Tillat og finn sone" }).click();
  await dialog.getByRole("button", { name: "Velg sone manuelt" }).click();
  await dialog.getByLabel("Hovedsone").selectOption("3");
  await page.evaluate(() =>
    (window as unknown as { resolvePosition: () => void }).resolvePosition(),
  );
  await expect(dialog.getByLabel("Hovedsone")).toHaveValue("3");
  await expect(dialog.getByRole("status")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Start fiske i Sone 3" })).toBeEnabled();
});
