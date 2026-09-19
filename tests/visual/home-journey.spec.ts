import { expect, test, type Page } from "@playwright/test";

async function restoreActiveTrip(page: Page, language = "no", withCatch = false) {
  await page.addInitScript(
    ({ language, withCatch }) => {
      if (localStorage.getItem("easyfisk:fishing-log:v1")) return;
      const startTime = Date.now() - 30 * 60 * 1000;
      localStorage.setItem("easyfisk-language", language);
      localStorage.setItem(
        "easyfisk:fishing-log:v1",
        JSON.stringify({
          version: 2,
          activeSession: { startTime, zone: 4, subzone: "Bjåhylen" },
          sessions: [],
          catches: withCatch
            ? [
                {
                  id: "existing-catch",
                  caughtAt: startTime + 1000,
                  submittedAt: startTime + 2000,
                  sessionStart: startTime,
                  species: "Laks",
                  result: "Gjenutsatt",
                  length: 65,
                  weight: 3,
                  zone: "Sone 4 · Bjåhylen",
                  violation: false,
                  late: false,
                },
              ]
            : [],
        }),
      );
    },
    { language, withCatch },
  );
  await page.goto("/");
  await expect(page.locator(".home-active-trip")).toContainText("Bjåhylen");
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 664 },
  { width: 412, height: 732 },
]) {
  for (const language of ["no", "en"]) {
    test(`active trip actions fit above navigation at ${viewport.width}px in ${language}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await restoreActiveTrip(page, language);
      const navigation = await page.locator(".bottom-nav").boundingBox();
      for (const name of language === "no"
        ? ["Registrer fangst", "Avslutt fisketuren"]
        : ["Register catch", "Finish trip"]) {
        const button = page.getByRole("button", { name, exact: true });
        await expect(button).toBeInViewport();
        const bounds = await button.boundingBox();
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(navigation!.y);
      }
      expect(await page.locator(".home-screen").evaluate((element) => element.scrollTop)).toBe(0);
      await page.screenshot({ path: `tmp/pdfs/ux-step2/active-${viewport.width}-${language}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test("finish preserves recorded catches without a last-trip card on home", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await restoreActiveTrip(page, "no", true);
  await expect(page.getByText("1 fangst registrert på turen")).toBeVisible();
  await page.getByRole("button", { name: "Avslutt fisketuren", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "1 fangst registrert", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Avslutt uten fangst", exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Avslutt tur med registrerte fangster" }).click();
  await expect(page.getByRole("dialog", { name: "Økt fullført" })).toContainText("1 fangst");
  await page.getByRole("button", { name: "Tilbake til oversikten" }).click();
  await expect(page.getByRole("button", { name: /Siste tur/ })).toHaveCount(0);
  await page.reload();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("easyfisk:fishing-log:v1")!),
  );
  expect(stored.activeSession).toBeNull();
  expect(stored.catches).toHaveLength(1);
  expect(stored.sessions).toHaveLength(1);
  expect(stored.sessions[0].result).toBe("1 fangst");
});

test("cancel missing catch returns to finish choice and keeps trip active", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await restoreActiveTrip(page);
  await page.getByRole("button", { name: "Avslutt fisketuren", exact: true }).click();
  await page.getByRole("button", { name: "Registrer manglende fangst" }).click();
  await page.getByRole("button", { name: "Lukk fangstrapport" }).click();
  await expect(page.getByRole("heading", { name: "Avslutte uten fangst?" })).toBeVisible();
  await page.getByRole("button", { name: "Fortsett å fiske" }).click();
  await expect(
    page.getByRole("button", { name: "Registrer fangst", exact: true }),
  ).toBeInViewport();
  await page.reload();
  await expect(page.locator(".home-active-trip")).toBeVisible();
  await page.getByRole("button", { name: "Avslutt fisketuren", exact: true }).click();
  await page.getByRole("button", { name: "Avslutt uten fangst", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Økt fullført" })).toContainText(
    "Nullfangst registrert",
  );
});

test("home groups preparation actions, then offers start", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Før du drar" })).toBeVisible();
  await expect(page.locator(".home-preparation-actions button")).toHaveText([
    "Kjøp fiskekort",
    "DesinfiseringRegistrer",
    "Statlig fiskeravgiftRegistrer",
  ]);
  await expect(page.getByText("Dette trenger du")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Registrer tidligere fisketur/ })).toBeVisible();
  await page.screenshot({ path: "tmp/pdfs/ux-step2/preparing.png" });
  for (const [scenario, action] of [
    ["expiredDisinfection", "Registrer desinfisering"],
    ["noFee", "Registrer statlig fiskeravgift"],
    ["ok", "Start fiske"],
  ]) {
    await page.getByRole("button", { name: "Mer", exact: true }).click();
    await page.getByRole("button", { name: /Statusmotor/ }).click();
    const dialog = page.getByRole("dialog", { name: "Statusmotor" });
    await dialog.getByLabel("Situasjon").selectOption(scenario);
    await dialog.getByRole("button", { name: /bruk valgt situasjon|valgt testsituasjon/i }).click();
    await expect(
      page.locator(".home-screen").getByRole("button", { name: action, exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator(".document-overview")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mine dokumenter", exact: true })).toHaveCount(0);
  await expect(page.locator(".home-ticket")).toContainText("Testvisning");
  await expect(page.locator(".home-screen .status-card")).toHaveCount(0);
  await expect(page.locator(".home-river")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Dokumentene er på plass/ })).toBeVisible();
  await page.screenshot({ path: "tmp/pdfs/ux-step2/ready.png" });
  await page.getByRole("button", { name: "Start fiske", exact: true }).click();
  await page.getByRole("button", { name: "Velg sone manuelt" }).click();
  await page.locator(".home-screen").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  // The existing start flow requires accepting the current rule version.
  await page.getByRole("checkbox", { name: "Jeg har lest og forstått reglene" }).check();
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect
    .poll(() => page.locator(".home-screen").evaluate((element) => element.scrollTop))
    .toBe(0);
  await expect(page.getByRole("button", { name: "Hjem", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("heading", { name: "Statistikk", exact: true })).toHaveCount(0);
});
