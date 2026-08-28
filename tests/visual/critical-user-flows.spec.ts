import { expect, test, type Page } from "@playwright/test";

async function resetApp(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
}

async function startFishing(page: Page) {
  await page.getByRole("button", { name: "START FISKE" }).click();
  await page.getByRole("button", { name: "Fortsett til posisjon" }).click();
  await page.getByRole("button", { name: "Velg sone manuelt" }).click();
  await page.getByLabel("Hovedsone").selectOption("3");
  await page.getByRole("button", { name: "Bekreft sone og se regler" }).click();
  await page.getByLabel("Jeg har lest og forstått reglene").check();
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect(page.getByText("Aktiv fiskeøkt")).toBeVisible();
}

async function completeCatchReport(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await dialog.getByRole("button", { name: "Neste · størrelse" }).click();
  await dialog.getByPlaceholder("cm").fill("65");
  await dialog.getByPlaceholder("kg").fill("3");
  await dialog.getByRole("button", { name: "Neste · regelkontroll" }).click();
  await dialog.getByRole("button", { name: "Send fangstrapport" }).click();
  await expect(dialog.getByRole("heading", { name: "Fangstrapporten er sendt" })).toBeVisible();
  return dialog;
}

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test("start fiske går gjennom fire steg og aktiv økt overlever refresh", async ({ page }) => {
  await startFishing(page);

  await page.reload();

  await expect(page.getByText("FISKEØKT PÅGÅR")).toBeVisible();
  await expect(page.getByRole("button", { name: "STOPP FISKE" })).toBeVisible();
});

test("fangst registreres gjennom hele skjemaet og kan korrigeres i dialogen", async ({ page }) => {
  await startFishing(page);
  await page.getByRole("button", { name: "Registrer fangst" }).click();
  const openedCatchDialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await expect(openedCatchDialog.getByRole("button", { name: "Lukk fangstrapport" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(openedCatchDialog.getByRole("button", { name: "Neste · størrelse" })).toBeFocused();
  const dialog = await completeCatchReport(page);
  await dialog.getByRole("button", { name: "Ferdig" }).click();

  await page.locator(".catch-history-card").first().click();
  const detail = page.getByRole("dialog", { name: /Laks · gjenutsatt/i });
  await expect(detail.getByRole("button", { name: "Lukk fangstrapport" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(detail.getByRole("button", { name: "Meld feil i rapporten" })).toBeFocused();
  await detail.getByRole("button", { name: "Meld feil i rapporten" }).click();
  await detail.getByLabel("Hva er feil i rapporten?").fill("Korrekt vekt er 3,2 kg.");
  await detail.getByRole("button", { name: "Send rettelsesmelding" }).click();

  await expect(detail.getByText("Rettelse er meldt")).toBeVisible();
  await expect(detail.getByText("Korrekt vekt er 3,2 kg.")).toBeVisible();
});

test("stopp økt med fangst fullfører rapporten før økten avsluttes", async ({ page }) => {
  await startFishing(page);
  await page.getByRole("button", { name: "Stopp · bekreft fangst eller nullfangst" }).click();
  await page.getByRole("button", { name: "Ja · registrer manglende fangst" }).click();

  const dialog = await completeCatchReport(page);
  await dialog.getByRole("button", { name: "Se sammendrag for økten" }).click();

  const summary = page.getByRole("dialog", { name: "Økt fullført" });
  await expect(summary.getByRole("heading", { name: "Takk for rapporteringen" })).toBeVisible();
  await summary.getByRole("button", { name: "Tilbake til oversikten" }).click();
  await expect(page.getByRole("button", { name: "START FISKE" })).toBeVisible();
  await expect(page.getByText("FISKEØKT PÅGÅR")).toHaveCount(0);
});

test("tidligere økt med fangst kan registreres gjennom hele skjemaet", async ({ page }) => {
  await page.getByRole("button", { name: "Statistikk" }).click();
  await page.getByRole("button", { name: "Min fangst og fiskehistorikk" }).click();
  await page.getByRole("button", { name: /Registrer tidligere fisketur/ }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  await dialog.getByLabel("Dato påkrevd").fill("2026-08-20");
  await dialog.getByLabel("Hovedsone påkrevd").selectOption("2");
  await dialog.getByLabel("Delsone påkrevd").selectOption({ index: 1 });
  await dialog.getByRole("button", { name: "Ja · legg til fangst" }).click();
  await dialog.getByRole("button", { name: "Neste · registrer fangst" }).click();
  await dialog.getByPlaceholder("cm").fill("62");
  await dialog.getByPlaceholder("kg").fill("2.8");
  await dialog.getByRole("button", { name: "Legg til og kontroller turen" }).click();
  await dialog.getByRole("button", { name: /Send inn tur og 1 fangst/ }).click();

  await expect(
    dialog.getByRole("heading", { name: "Tur og fangster er registrert" }),
  ).toBeVisible();
});

test("lagringsfeil vises i fangstskjemaet uten falsk bekreftelse", async ({ page }) => {
  await startFishing(page);
  await page.getByRole("button", { name: "Registrer fangst" }).click();
  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await dialog.getByRole("button", { name: "Neste · størrelse" }).click();
  await dialog.getByPlaceholder("cm").fill("65");
  await dialog.getByPlaceholder("kg").fill("3");
  await dialog.getByRole("button", { name: "Neste · regelkontroll" }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Lagringskvoten er overskredet", "QuotaExceededError");
    };
  });
  await dialog.getByRole("button", { name: "Send fangstrapport" }).click();

  await expect(dialog.getByRole("alert")).toContainText("Kunne ikke lagre fiskedata på enheten");
  await expect(dialog.getByRole("heading", { name: "Rapporten er kontrollert" })).toBeVisible();
  await expect(dialog.getByText("Fangstrapporten er sendt")).toHaveCount(0);
});

test("dialoger holder tastaturfokus og kan lukkes med Escape", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "START FISKE" });
  await trigger.focus();
  await trigger.press("Enter");
  const startDialog = page.getByRole("dialog", { name: "Start fiske" });
  await expect(startDialog.getByRole("button", { name: "Lukk" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(startDialog.getByRole("button", { name: "Fortsett til posisjon" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(startDialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: "Statistikk" }).click();
  await page.getByRole("button", { name: "Min fangst og fiskehistorikk" }).click();
  const pastTrigger = page.getByRole("button", { name: /Registrer tidligere fisketur/ });
  await pastTrigger.click();
  const pastDialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  await expect(pastDialog.getByRole("button", { name: "Lukk registrering" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(pastDialog).toHaveCount(0);
  await expect(pastTrigger).toBeFocused();

  await page.getByRole("button", { name: "Mer" }).click();
  const profileTrigger = page.getByRole("button", { name: /Mine fiskekort/ });
  await profileTrigger.click();
  const profileDialog = page.getByRole("dialog", { name: "Mine fiskekort" });
  await expect(profileDialog.getByRole("button", { name: "Tilbake" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(profileDialog).toHaveCount(0);
  await expect(profileTrigger).toBeFocused();
});
