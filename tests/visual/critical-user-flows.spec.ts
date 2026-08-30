import { expect, test, type Page } from "@playwright/test";

async function resetApp(page: Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    window.localStorage.clear();
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase("easyfisk-documents");
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
  await page.reload();
}

async function seedRequiredDocuments(page: Page) {
  await page.evaluate(async () => {
    const now = new Date();
    const localInput = (date: Date) => {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
      return local.toISOString().slice(0, 16);
    };
    const year = new Intl.DateTimeFormat("nb-NO", {
      year: "numeric",
      timeZone: "Europe/Oslo",
    }).format(now);
    const records = [
      {
        id: "test-permit",
        kind: "permit",
        updatedAt: now.getTime(),
        values: {
          holder: "Testfisker",
          issuer: "Testutsteder",
          category: "Døgnkort",
          area: "Mandalselva · Sone 3",
          startsAt: localInput(new Date(now.getTime() - 60 * 60 * 1000)),
          endsAt: localInput(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
        },
      },
      {
        id: "test-disinfection",
        kind: "disinfection",
        updatedAt: now.getTime(),
        values: {
          holder: "Testfisker",
          issuer: "Teststasjon",
          performedAt: localInput(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
          equipment: "Stang, snelle og vadere",
        },
      },
      {
        id: "test-fee",
        kind: "fee",
        updatedAt: now.getTime(),
        values: {
          holder: "Testfisker",
          year,
          category: "Enkeltperson",
          paidAt: `${year}-01-15`,
        },
      },
    ];
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("easyfisk-documents", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("documents", { keyPath: "id" });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transaction = request.result.transaction("documents", "readwrite");
        records.forEach((record) => transaction.objectStore("documents").put(record));
        transaction.oncomplete = () => {
          request.result.close();
          window.dispatchEvent(new Event("easyfisk-documents-changed"));
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
  await expect(page.getByRole("heading", { name: "Kontroller dokumentene" })).toBeVisible();
}

async function startFishing(page: Page) {
  await seedRequiredDocuments(page);
  await page.getByRole("button", { name: "KONTROLLER OG START" }).click();
  await page.getByRole("button", { name: "Jeg har kontrollert originalene · fortsett" }).click();
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

test("tidligere fisketur er tilgjengelig uten å starte fiske", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: "Registrer tidligere fisketur" }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  const nextButton = dialog.getByRole("button", { name: "Neste · regelkontroll" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Lukk registrering" })).toBeInViewport();
  await expect(nextButton).toBeInViewport();
  await dialog.getByRole("button", { name: "Ja · legg til fangst" }).click();
  await expect(dialog.getByRole("button", { name: "Neste · registrer fangst" })).toBeInViewport();
  await dialog.getByRole("button", { name: "Nei · nullfangst" }).click();
  await nextButton.click();
  await expect(
    dialog.getByRole("heading", { name: "Kontroller turen før innsending" }),
  ).toBeVisible();
});

test("fiskekort kan registreres lokalt med originalvedlegg og beholdes etter refresh", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: /Fiskekort/ }).click();
  const dialog = page.getByRole("dialog", { name: "Mine fiskekort" });
  await dialog.getByRole("button", { name: "Registrer fiskekort" }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Kari Fisker");
  await dialog.getByLabel("Utsteder / selger *").fill("INatur");
  await dialog.getByLabel("Korttype *").selectOption("Døgnkort");
  await dialog.getByLabel("Vassdrag, sone og eventuell delsone *").fill("Mandalselva · Sone 3");
  await dialog.getByLabel("Gyldig fra (norsk tid) *").fill("2026-08-20T18:00");
  await dialog.getByLabel("Gyldig til (norsk tid) *").fill("2026-08-21T18:00");
  await dialog.getByLabel(/Bilde eller PDF/).setInputFiles({
    name: "fiskekort.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 prototype"),
  });
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Kari Fisker" })).toBeVisible();
  await expect(dialog.getByText("Egenregistrert · ikke eksternt verifisert")).toBeVisible();
  await expect(dialog.getByRole("link", { name: /fiskekort.pdf/ })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Fiskekort/ }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Mine fiskekort" })
      .getByRole("heading", { name: "Kari Fisker" }),
  ).toBeVisible();
});

test("desinfisering og fiskeravgift kan registreres med relevante opplysninger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: /Desinfisering/ }).click();
  let dialog = page.getByRole("dialog", { name: "Desinfisering" });
  await dialog.getByRole("button", { name: "Registrer desinfisering" }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Kari Fisker");
  await dialog
    .getByLabel("Stasjon / hvem som utførte desinfiseringen *")
    .fill("Møll Bensinstasjon");
  await dialog.getByLabel("Utført (norsk tid) *").fill("2026-08-20T12:30");
  await dialog.getByLabel("Utstyr som ble desinfisert *").fill("Stang, snelle, vadere og håv");
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Kari Fisker" })).toBeVisible();
  await dialog.getByRole("button", { name: /Tilbake/ }).click();

  await page.getByRole("button", { name: /Statlig fiskeravgift/ }).click();
  dialog = page.getByRole("dialog", { name: "Statlig fiskeravgift" });
  await dialog.getByRole("button", { name: "Registrer statlig fiskeravgift" }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Kari Fisker");
  await dialog.getByLabel("Kalenderår *").fill("2026");
  await dialog.getByLabel("Avgift / fritak *").selectOption("Enkeltperson");
  await dialog.getByLabel("Betalingsdato (ikke nødvendig ved fritak)").fill("2026-05-15");
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Kari Fisker" })).toBeVisible();
});

test("hjemskjermen viser en rulleindikator som følger siden", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  const screen = page.locator(".screen");
  const indicator = page.locator(".scroll-indicator.visible");
  const thumb = indicator.locator("i");
  await expect(indicator).toBeVisible();
  const before = await thumb.evaluate((element) => getComputedStyle(element).top);
  await screen.evaluate((element) => element.scrollBy(0, 500));
  await expect
    .poll(() => thumb.evaluate((element) => getComputedStyle(element).top))
    .not.toBe(before);
});

test("fiskestart blokkeres når nødvendig dokumentasjon mangler", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Dokumentasjon mangler" })).toBeVisible();
  await page.getByRole("button", { name: "SE HVA SOM MANGLER" }).click();
  const dialog = page.getByRole("dialog", { name: "Start fiske" });
  await expect(dialog.getByRole("heading", { name: "Dokumentasjon mangler" })).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Lukk og registrer dokumentasjon" }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Fortsett til posisjon" })).toHaveCount(0);
});

test("etterregistrering kan lukkes med X på mobil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: "Registrer tidligere fisketur" }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  await dialog.getByRole("button", { name: "Lukk registrering" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Statistikk", exact: true })).toBeVisible();
});

test("statusmotoren kan endres fra innstillinger på mobil", async ({ page }) => {
  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();

  const dialog = page.getByRole("dialog", { name: "Statusmotor" });
  await dialog.getByLabel("Situasjon").selectOption("noPermit");
  await expect(dialog.getByRole("status")).toContainText("Blokkerer oppstart");
  await dialog.getByRole("button", { name: "Test valgt situasjon" }).click();

  const startDialog = page.getByRole("dialog", { name: "Start fiske" });
  await expect(startDialog.getByRole("heading", { name: "Du mangler fiskekort" })).toBeVisible();
  await expect(startDialog.getByRole("button", { name: "Registrer fiskekort" })).toBeVisible();
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

test("fangstskjemaets neste-knapp er tilgjengelig på en lav mobilskjerm", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await startFishing(page);
  await page.getByRole("button", { name: "Registrer fangst" }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  const nextButton = dialog.getByRole("button", { name: "Neste · størrelse" });

  await expect(nextButton).toBeInViewport();
  await nextButton.click();
  await expect(dialog.getByRole("heading", { name: "Størrelse og dokumentasjon" })).toBeVisible();
});

test("fangstskjemaet kan lukkes med X på en lav mobilskjerm", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await startFishing(page);
  await page.getByRole("button", { name: "Registrer fangst" }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await dialog.getByRole("button", { name: "Lukk fangstrapport" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("AKTIV FISKEØKT")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "KONTROLLER OG START" })).toBeVisible();
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
  await dialog.getByRole("button", { name: "Åpne historikken" }).click();
  await page.locator(".history-card").filter({ hasText: "Sone 2" }).click();
  await expect(page.getByRole("dialog", { name: "Detaljer for fiskeøkt" })).toContainText(
    "Gjenutsatt · 62 cm · 2,8 kg",
  );
  await page.getByRole("button", { name: "Lukk øktdetaljer" }).click();

  await page.reload();
  await page.getByRole("button", { name: "Statistikk" }).click();
  await page.getByRole("button", { name: "Min fangst og fiskehistorikk" }).click();
  await expect(page.locator(".history-card").filter({ hasText: "Sone 2" })).toBeVisible();
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
  await seedRequiredDocuments(page);
  const trigger = page.getByRole("button", { name: "KONTROLLER OG START" });
  await trigger.focus();
  await trigger.press("Enter");
  const startDialog = page.getByRole("dialog", { name: "Start fiske" });
  await expect(startDialog.getByRole("button", { name: "Lukk" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    startDialog.getByRole("button", { name: "Jeg har kontrollert originalene · fortsett" }),
  ).toBeFocused();
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
