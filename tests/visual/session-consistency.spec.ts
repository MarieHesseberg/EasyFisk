import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("manual zone and subzone survive refresh and map exploration on mobile", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page.getByRole("button", { name: "Sone 4", exact: true }).click();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  const settings = page.getByRole("dialog", { name: "Statusmotor" });
  await settings.getByLabel("Situasjon").selectOption("ok");
  await settings.getByRole("button", { name: /bruk valgt situasjon/i }).click();
  await page.getByRole("button", { name: "START FISKE", exact: true }).click();
  await page.getByRole("button", { name: "Velg sone manuelt" }).click();
  await expect(page.getByLabel("Hovedsone", { exact: true })).toHaveValue("4");
  await expect(page.getByRole("button", { name: "Start fiske i Sone 4" })).toBeDisabled();
  await page.getByLabel("Delsone", { exact: true }).selectOption("Bjåhylen");
  await page.getByRole("button", { name: "Start fiske i Sone 4" }).click();
  await page.reload();
  await expect(page.locator(".active-session")).toContainText("Bjåhylen");
  await expect(page.locator(".active-session")).toContainText("Sone 4");
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page.getByRole("button", { name: "Sone 1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bruk sone 1 i fiskeøkten" })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Start fiske" })).toHaveCount(0);
  // The development toolbar overlaps the center of Home on this mobile viewport.
  await page.getByRole("button", { name: "Hjem", exact: true }).press("Enter");
  await expect(page.locator(".active-session")).toContainText("Bjåhylen");
  await page.getByRole("button", { name: "Avslutt tur", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Bjåhylen");
  await page.screenshot({ path: "tmp/pdfs/ux-step2/mobile-stop.png" });
  expect(pageErrors).toEqual([]);
});

test("document folder follows the same permit creation policy as My permits", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: "Mine dokumenter", exact: true }).click();
  const folder = page.getByRole("dialog");
  await expect(
    folder.getByRole("button", { name: "Registrer fiskekort", exact: true }),
  ).toHaveCount(0);
  await folder.getByRole("button", { name: "Desinfisering", exact: true }).click();
  await expect(
    folder.getByRole("button", { name: "Legg til eksisterende bevis manuelt" }),
  ).toBeVisible();
});
