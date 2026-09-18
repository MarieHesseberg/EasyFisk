import { expect, test } from "@playwright/test";

test("purchase, documents and a completed trip share the same date without status overrides", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 3", exact: true }).click();
  await shop.locator("article").filter({ hasText: "Sone 3 døgnkort" }).getByRole("button").click();
  await expect(shop.getByRole("button", { name: /20\. august 2026/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(shop.getByRole("button", { name: /19\. august 2026/ })).toBeDisabled();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await shop.getByLabel("Fullt navn").fill("Test Fisker");
  await shop.getByLabel("Fødselsdato").fill("1990-05-12");
  await shop.getByLabel("E-post").fill("fisker@example.no");
  await shop.getByLabel("Telefon").fill("98765432");
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await expect(shop.getByRole("heading", { name: "Godkjenn betaling" })).toBeVisible();
  await expect(shop.getByText("Ingen penger trekkes.", { exact: true })).toBeVisible();
  await shop.getByRole("button", { name: "Godkjenn 455 kr" }).click();
  await expect(shop.getByRole("heading", { name: "Betaling godkjent" })).toBeVisible();
  await expect(shop.getByRole("status")).toContainText("Fiskekortet er lagret");
  await page.screenshot({ path: testInfo.outputPath("payment-confirmation.png") });
  await shop.getByRole("button", { name: "Åpne fiskekort" }).click();
  await expect(page.getByRole("heading", { name: "Mine fiskekort", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("button", { name: "Mine fiskekort", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Regler", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Regler for Sone 3/ })).toBeVisible();
  await expect(page.getByText(/Vi mangler fiskekortet ditt/)).toHaveCount(0);

  await expect(
    page.getByText("Fiskekortsalget er avsluttet for 2026", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await page.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Statlig fiskeravgift" });
  await dialog.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Test Fisker");
  await expect(dialog.getByLabel("Kalenderår *")).toHaveValue("2026");
  await expect(dialog.getByLabel("Betalingsdato (ikke nødvendig ved fritak)")).toHaveValue(
    "2026-08-20",
  );
  await dialog.getByLabel("Avgift / fritak *").selectOption("Enkeltperson");
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Test Fisker" })).toBeVisible();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await page.getByRole("button", { name: "Registrer desinfisering", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Desinfisering" });
  await dialog.getByRole("button", { name: "Legg til eksisterende bevis manuelt" }).click();
  await dialog.getByLabel("Navn på fiskeren *").fill("Test Fisker");
  await dialog.getByLabel("Stasjon / hvem som utførte desinfiseringen *").fill("Teststasjon");
  await expect(dialog.getByLabel("Utført (norsk tid) *")).toHaveValue(/^2026-08-20T18:0/);
  await dialog.getByLabel("Utstyr som ble desinfisert *").fill("Stang og vadere");
  await dialog.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(dialog.getByRole("heading", { name: "Test Fisker" })).toBeVisible();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await page.reload();
  await page.evaluate(() =>
    localStorage.setItem(
      "easyfisk-rule-acceptances-v1",
      JSON.stringify([
        { person: "local-profile", version: "previous-test-version", acceptedAt: 1 },
      ]),
    ),
  );
  await page.getByRole("button", { name: "START FISKE", exact: true }).click();
  await page.getByRole("button", { name: "Velg sone manuelt" }).click();
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Fiskereglene er endret siden sist" }),
  ).toBeVisible();
  await page.getByLabel("Jeg har lest og forstått reglene").check();
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await expect(page.getByText("AKTIV FISKEØKT")).toBeVisible();
  await page.reload();
  await expect(page.getByText("AKTIV FISKEØKT")).toBeVisible();
  await page.getByRole("button", { name: "Avslutt tur", exact: true }).click();
  await page.getByRole("button", { name: "Avslutt uten fangst", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Økt fullført" })).toBeVisible();
});
