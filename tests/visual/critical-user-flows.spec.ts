import { expect, test, type Locator, type Page } from "@playwright/test";

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

async function selectAllOkayStatus(page: Page, startTest = true) {
  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  const dialog = page.getByRole("dialog", { name: "Statusmotor" });
  await dialog.getByLabel("Situasjon").selectOption("ok");
  if (startTest) {
    await dialog.getByRole("button", { name: /bruk valgt situasjon/i }).click();
    await page.getByRole("button", { name: "START FISKE" }).click();
  } else {
    await dialog.getByRole("button", { name: /bruk valgt situasjon/i }).click();
  }
}

async function startFishing(page: Page) {
  await selectAllOkayStatus(page);
  await page.getByRole("button", { name: "Velg sone manuelt" }).click();
  await page.getByLabel("Hovedsone").selectOption("3");
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect(page.getByText("Aktiv fiskeøkt")).toBeVisible();
}

async function completeCatchReport(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await dialog.getByRole("button", { name: "Neste · størrelse" }).click();
  await dialog.getByPlaceholder("cm").fill("65");
  await dialog.getByPlaceholder("kg").fill("3");
  await dialog.getByRole("button", { name: "Neste · regelkontroll" }).click();
  await dialog.getByRole("button", { name: "Lagre fangst" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Fangsten er lagret på denne enheten" }),
  ).toBeVisible();
  return dialog;
}

async function completePermitCheckoutDetails(shop: Locator, group = false) {
  await shop.getByLabel("Fullt navn", { exact: true }).fill("Marie Hesseberg");
  await shop.getByLabel("Fødselsdato").fill("1990-05-12");
  await shop.getByLabel("E-post").fill("marie@example.no");
  await shop.getByLabel("Telefon").fill("98765432");
  if (group) await shop.getByLabel(/Medfiskere/).fill("Ola Nordmann");
  await shop.getByLabel(/Jeg har lest og forstått fiskereglene/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: "Neste · kontroller" }).click();
}

async function selectPaymentOutcome(page: Page, outcome: "approved" | "cancelled" | "failed") {
  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  const dialog = page.getByRole("dialog", { name: "Statusmotor" });
  await dialog.getByLabel("Resultat ved neste betaling").selectOption(outcome);
  await dialog.getByRole("button", { name: "Tilbake" }).click();
}

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test("fiskekortbutikken åpnes fra hjem, kart, Mer og Mine fiskekort", async ({ page }) => {
  await page.getByRole("button", { name: "Kjøp fiskekort" }).click();
  let shop = page.locator(".permit-shop-screen");
  await expect(shop).toBeVisible();
  await page.getByRole("button", { name: "Mer", exact: true }).click();

  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page
    .locator(".map-zone-switcher")
    .getByRole("button", { name: "Sone 3", exact: true })
    .click();
  await page.getByRole("button", { name: /Fiskekort i sone/ }).click();
  shop = page.locator(".permit-shop-screen");
  await expect(shop).toBeVisible();
  await page.getByRole("button", { name: "Mer", exact: true }).click();

  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Fiskekort og kjøp/ }).click();
  shop = page.locator(".permit-shop-screen");
  await expect(shop).toBeVisible();
  await page.getByRole("button", { name: "Mer", exact: true }).click();

  await page.getByRole("button", { name: /Mine fiskekort/ }).click();
  const permits = page.getByRole("dialog", { name: "Mine fiskekort" });
  await permits.getByRole("button", { name: "Kjøp nytt fiskekort" }).click();
  await expect(page.locator(".permit-shop-screen")).toBeVisible();
});

test("fiskekortbutikken har en egen fane i hovednavigasjonen", async ({ page }) => {
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kjøp fiskekort" })).toBeVisible();
  await expect(page.getByLabel("Fiskekortbutikk")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fiskekort", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("rapporteringskort krever sesongkort og åpner ikke testbetaling", async ({ page }) => {
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await page.getByRole("button", { name: "Sone 2" }).click();
  await page.getByLabel("Delsone eller salgsområde").selectOption("Holmegård");
  await page.getByRole("button", { name: "Velg rapporteringskort" }).click();
  await expect(page.getByText("Sesongkort må registreres først")).toBeVisible();
  await expect(page.getByRole("region", { name: "Salgskalender" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Fortsett til døgnregistrering" })).toBeDisabled();
  await expect(page.getByText(/Testbetaling/)).toHaveCount(0);
});

test("testkjøpt gruppekort oppdaterer status og overlever refresh", async ({ page }) => {
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 2" }).click();
  await shop.getByLabel("Delsone eller salgsområde").selectOption("Fuskeland");
  await shop.getByRole("button", { name: "Kjøp fiskekort" }).click();
  await shop.getByRole("button", { name: /30\. august 2026/ }).click();
  await expect(shop.getByText("Fuskeland gruppekort")).toBeVisible();
  await shop.getByText("Vilkår og produktinformasjon", { exact: true }).click();
  await expect(shop.getByText(/inntil tre stenger/i)).toBeVisible();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await expect(shop.locator(".permit-test-warning")).toHaveCount(0);
  await completePermitCheckoutDetails(shop, true);
  const reviewSummary = shop.locator(".permit-order-summary");
  await expect(reviewSummary).not.toContainText("Administrasjonsgebyr");
  await expect(reviewSummary).toContainText("1 kort · 2 deltakere");
  await expect(reviewSummary).toContainText("Totalt beløp2400 kr");
  await expect(shop.locator(".permit-test-warning")).toHaveCount(0);
  await shop.getByRole("button", { name: "Betal 2400 kr" }).click();
  await expect(shop.getByRole("status")).toContainText("Fiskekortet er lagret");
  await expect(shop.getByRole("status")).toContainText("Sone 2 · Fuskeland");
  await expect(shop.getByRole("status")).toContainText("EF-TEST-");
  await expect(shop.getByRole("status")).toContainText("2400 kr");
  await expect(shop.getByRole("button", { name: "Åpne fiskekort" })).toBeVisible();
  await expect(shop.getByRole("button", { name: "Tilbake til hjem" })).toBeVisible();
  await expect(shop.getByRole("button", { name: "Registrer fiskeravgift" })).toBeVisible();
  await expect(shop.getByRole("button", { name: "Registrer desinfisering" })).toBeVisible();
  await shop.getByRole("button", { name: "Registrer fiskeravgift" }).click();
  const feeDialog = page.getByRole("dialog", { name: "Statlig fiskeravgift" });
  await expect(feeDialog).toBeVisible();
  await feeDialog.getByRole("button", { name: /Tilbake/ }).click();
  await shop.getByRole("button", { name: "Åpne fiskekort" }).click();
  await expect(page.getByRole("dialog", { name: "Mine fiskekort" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine fiskekort/ }).click();
  const storedPermits = page.getByRole("dialog", { name: "Mine fiskekort" });
  await expect(storedPermits).toContainText("Fuskeland");
  await expect(storedPermits).toContainText("Gruppekort");
  await storedPermits.getByRole("button", { name: /Tilbake/ }).click();

  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page.getByRole("button", { name: "Sone 1", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Interaktivt kart over Mandalselva" })
      .getByRole("heading", { name: /Sone 1/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sone 4", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Interaktivt kart over Mandalselva" })
      .getByRole("heading", { name: /Sone 4/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hjem" }).click();
});

test("utsolgt kort, testdato og avbrutt eller feilet betaling håndteres", async ({ page }) => {
  await selectPaymentOutcome(page, "cancelled");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 3" }).click();

  const soldOut = shop.locator("article").filter({ hasText: "Sone 3 døgnkort" });
  await soldOut.getByRole("button", { name: "Kjøp fiskekort" }).click();
  await expect(shop.getByRole("button", { name: /25\. august 2026: Utsolgt/ })).toBeDisabled();
  await shop.getByRole("button", { name: /Tilbake til fiskekort/ }).click();

  const dayPermit = shop.locator("article").filter({ hasText: "Sone 3 døgnkort" });
  await dayPermit.getByRole("button", { name: "Kjøp fiskekort" }).click();
  await shop.getByRole("button", { name: /20\. august 2026/ }).click();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await completePermitCheckoutDetails(shop);
  await expect(shop.getByRole("radio")).toHaveCount(0);
  await shop.getByRole("button", { name: "Betal 455 kr" }).click();
  await expect(shop.getByRole("alert")).toContainText("Betalingen ble avbrutt");

  await resetApp(page);
  await selectPaymentOutcome(page, "failed");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const failedShop = page.locator(".permit-shop-screen");
  await failedShop.getByRole("button", { name: "Sone 3" }).click();
  const failedPermit = failedShop.locator("article").filter({ hasText: "Sone 3 døgnkort" });
  await failedPermit.getByRole("button", { name: "Kjøp fiskekort" }).click();
  await failedShop.getByRole("button", { name: /20\. august 2026/ }).click();
  await failedShop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await completePermitCheckoutDetails(failedShop);
  await failedShop.getByRole("button", { name: "Betal 455 kr" }).click();
  await expect(failedShop.getByRole("alert")).toContainText("Testbetalingen feilet");
});

for (const viewport of [
  { name: "iPhone", width: 390, height: 664 },
  { name: "Android", width: 412, height: 732 },
]) {
  test(`fiskekortbutikken kan rulles og brukes på ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "Kjøp fiskekort" }).click();
    const shop = page.locator(".permit-shop-screen");
    await expect(shop).toBeVisible();
    await shop.getByRole("button", { name: "Kjøp fiskekort" }).first().scrollIntoViewIfNeeded();
    await expect(shop.getByRole("button", { name: "Kjøp fiskekort" }).first()).toBeInViewport();
    await page.getByRole("button", { name: "Hjem", exact: true }).click();
    await expect(shop).toHaveCount(0);
  });
}

test("tidligere fisketur er tilgjengelig uten å starte fiske", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: /Registrer en tidligere fisketur/ }).click();

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

test("fiskekort kan bare opprettes gjennom kjøpsflyten", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine fiskekort/ }).click();
  const dialog = page.getByRole("dialog", { name: "Mine fiskekort" });
  await expect(dialog.getByText(/Fiskekort utstedes gjennom kjøpsflyten/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Registrer fiskekort" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Kjøp nytt fiskekort" })).toBeVisible();
});

test("desinfisering og fiskeravgift kan registreres med relevante opplysninger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: /desinfisering/i }).click();
  let dialog = page.getByRole("dialog", { name: "Desinfisering" });
  await dialog.getByRole("button", { name: "Legg til eksisterende bevis manuelt" }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Kari Fisker");
  await dialog
    .getByLabel("Stasjon / hvem som utførte desinfiseringen *")
    .fill("Møll Bensinstasjon");
  await dialog.getByLabel("Utført (norsk tid) *").fill("2026-08-20T12:30");
  await dialog.getByLabel("Utstyr som ble desinfisert *").fill("Stang, snelle, vadere og håv");
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Kari Fisker" })).toBeVisible();
  await dialog.getByRole("button", { name: /Tilbake/ }).click();

  await page.getByRole("button", { name: /statlig fiskeravgift/i }).click();
  dialog = page.getByRole("dialog", { name: "Statlig fiskeravgift" });
  await dialog.getByRole("button", { name: "Registrer statlig fiskeravgift" }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Kari Fisker");
  await dialog.getByLabel("Kalenderår *").fill("2026");
  await dialog.getByLabel("Avgift / fritak *").selectOption("Enkeltperson");
  await dialog.getByLabel("Betalingsdato (ikke nødvendig ved fritak)").fill("2026-05-15");
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Kari Fisker" })).toBeVisible();
});

test("fiskeren får praktiske desinfiseringsregler og kan registrere bevis", async ({ page }) => {
  await page.getByRole("button", { name: /desinfisering/i }).click();
  const dialog = page.getByRole("dialog", { name: "Desinfisering" });
  await dialog.getByText("Mer informasjon", { exact: true }).click();
  await expect(dialog.getByText(/Alt utstyr som skal brukes i Mandalselva/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Godkjenn desinfisering" })).toHaveCount(0);
  await expect(
    dialog.getByRole("button", { name: "Legg til eksisterende bevis manuelt" }),
  ).toBeVisible();
});

test("hjemskjermen viser en rulleindikator når innholdet krever rulling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  const screen = page.locator(".screen");
  const indicator = page.locator(".scroll-indicator.visible");
  const thumb = indicator.locator("i");
  await expect(indicator).toBeVisible();
  const trackAtTop = await indicator.boundingBox();
  const thumbAtTop = await thumb.boundingBox();
  expect(Math.abs(thumbAtTop!.y - trackAtTop!.y)).toBeLessThanOrEqual(1);

  await screen.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  await expect
    .poll(async () => {
      const track = await indicator.boundingBox();
      const marker = await thumb.boundingBox();
      return Math.abs(marker!.y + marker!.height - (track!.y + track!.height));
    })
    .toBeLessThanOrEqual(1);
});

test("fiskestart blokkeres når nødvendig dokumentasjon mangler", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Gjør deg klar til å fiske" })).toBeVisible();
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page
    .locator(".map-zone-switcher")
    .getByRole("button", { name: "Sone 3", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Bruk sone 3 i fiskeøkten" })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Start fiske" })).toHaveCount(0);
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("button", { name: "START FISKE", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
});

test("etterregistrering kan lukkes med X på mobil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: /Registrer en tidligere fisketur/ }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  await dialog.getByRole("button", { name: "Lukk registrering" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Statistikk", exact: true })).toBeVisible();
});

test("statusmotoren kan endres fra innstillinger på mobil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();

  const dialog = page.getByRole("dialog", { name: "Statusmotor" });
  await expect(dialog.getByLabel("Situasjon")).toHaveValue("allMissing");
  await expect(dialog.getByRole("status")).toContainText("Blokkerer oppstart");
  await dialog.getByLabel("Situasjon").selectOption("noPermit");
  await expect(dialog.getByRole("status")).toContainText("Blokkerer oppstart");
  await dialog.getByRole("button", { name: /bruk valgt situasjon/i }).click();

  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(
    page.locator(".home-preparation-actions").getByRole("button", { name: "Kjøp fiskekort" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page
    .locator(".map-zone-switcher")
    .getByRole("button", { name: "Sone 3", exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "Start fiske" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Fiskekort i sone 3" })).toBeVisible();

  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  const readyDialog = page.getByRole("dialog", { name: "Statusmotor" });
  await readyDialog.getByLabel("Situasjon").selectOption("ok");
  await expect(readyDialog.getByRole("status")).toContainText("Oppstart tillatt");
  await readyDialog.getByRole("button", { name: /bruk valgt situasjon/i }).click();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(page.getByText("Dokumentkrav registrert i appen")).toBeVisible();
  await expect(page.locator(".document-overview")).toHaveCount(0);
});

test("start fiske bruker ett steg og aktiv økt overlever refresh", async ({ page }) => {
  await startFishing(page);

  await page.reload();

  await expect(page.getByText("AKTIV FISKEØKT")).toBeVisible();
  await expect(page.getByRole("button", { name: "Avslutt tur", exact: true })).toBeVisible();
});

test("fangst registreres gjennom hele skjemaet og kan korrigeres i dialogen", async ({ page }) => {
  await startFishing(page);
  await page.getByRole("button", { name: "Registrer fangst" }).click();
  const openedCatchDialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await expect(openedCatchDialog.getByRole("button", { name: "Lukk fangstrapport" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.locator(".bottom-nav").getByRole("button", { name: "Mer", exact: true }),
  ).toBeFocused();
  const dialog = await completeCatchReport(page);
  await dialog.getByRole("button", { name: "Ferdig" }).click();

  await page.locator(".home-trip-summary").click();
  await page.locator(".catch-history-card").first().click();
  const detail = page.getByRole("dialog", { name: /Laks · gjenutsatt/i });
  await expect(detail.getByRole("button", { name: "Lukk fangstrapport" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.locator(".bottom-nav").getByRole("button", { name: "Mer", exact: true }),
  ).toBeFocused();
  await detail.getByRole("button", { name: "Meld feil i rapporten" }).click();
  await detail.getByLabel("Hva er feil i rapporten?").fill("Korrekt vekt er 3,2 kg.");
  await detail.getByRole("button", { name: "Lagre rettelse lokalt" }).click();

  await expect(detail.getByText("Rettelse lagret lokalt")).toBeVisible();
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
  await page.getByRole("button", { name: "Avslutt tur", exact: true }).click();
  await page.getByRole("button", { name: "Registrer manglende fangst" }).click();

  const dialog = await completeCatchReport(page);
  await dialog.getByRole("button", { name: "Se sammendrag for økten" }).click();

  const summary = page.getByRole("dialog", { name: "Økt fullført" });
  await expect(summary.getByRole("heading", { name: "Takk for rapporteringen" })).toBeVisible();
  await summary.getByRole("button", { name: "Tilbake til oversikten" }).click();
  await expect(page.getByRole("button", { name: "START FISKE" })).toBeVisible();
  await expect(page.getByText("AKTIV FISKEØKT")).toHaveCount(0);
});

test("tidligere økt med fangst kan registreres gjennom hele skjemaet", async ({ page }) => {
  await page.getByRole("button", { name: /Registrer en tidligere fisketur/ }).click();

  const dialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  await dialog.getByLabel("Dato påkrevd").fill("2026-08-20");
  await dialog.getByLabel("Hovedsone påkrevd").selectOption("2");
  await dialog.getByLabel("Delsone påkrevd").selectOption({ index: 1 });
  await dialog.getByRole("button", { name: "Ja · legg til fangst" }).click();
  await dialog.getByRole("button", { name: "Neste · registrer fangst" }).click();
  await dialog.getByPlaceholder("cm").fill("62");
  await dialog.getByPlaceholder("kg").fill("2.8");
  await dialog.getByRole("button", { name: "Legg til og kontroller turen" }).click();
  await dialog.getByRole("button", { name: /Lagre tur og 1 fangst/ }).click();

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
  await page.getByRole("button", { name: "Mer" }).click();
  await page.getByRole("button", { name: /Statistikk og fiskehistorikk/ }).click();
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
  await dialog.getByRole("button", { name: "Lagre fangst" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "Kunne ikke lagre dataene på denne enheten. Kontroller lagringsplassen og prøv igjen.",
  );
  await expect(dialog.getByRole("heading", { name: "Rapporten er kontrollert" })).toBeVisible();
  await expect(dialog.getByText("Fangsten er lagret på denne enheten")).toHaveCount(0);
});

test("dialoger holder tastaturfokus og kan lukkes med Escape", async ({ page }) => {
  await selectAllOkayStatus(page, false);
  const trigger = page.getByRole("button", { name: "START FISKE" });
  await trigger.focus();
  await trigger.press("Enter");
  const startDialog = page.getByRole("dialog", { name: "Start fiske" });
  await expect(startDialog.getByRole("button", { name: "Lukk" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.locator(".bottom-nav").getByRole("button", { name: "Mer", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(startDialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  const pastTrigger = page.getByRole("button", { name: /Registrer en tidligere fisketur/ });
  await pastTrigger.click();
  const pastDialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
  await expect(pastDialog.getByRole("button", { name: "Lukk registrering" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(pastDialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Registrer tidligere fisketur/ })).toBeFocused();

  await page.getByRole("button", { name: "Mer" }).click();
  const profileTrigger = page.getByRole("button", { name: /Mine fiskekort/ });
  await profileTrigger.click();
  const profileDialog = page.getByRole("dialog", { name: "Mine fiskekort" });
  await expect(profileDialog.getByRole("button", { name: "Tilbake" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(profileDialog).toHaveCount(0);
  await expect(profileTrigger).toBeFocused();
});
