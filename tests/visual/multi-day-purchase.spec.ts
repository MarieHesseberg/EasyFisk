import { expect, test } from "@playwright/test";
test("mobile multi-day purchase fills profile, separates angler and survives reload", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "easyfisk-profile-v1",
      JSON.stringify({
        fullName: "Kari Nordmann",
        birthDate: "1990-01-01",
        email: "kari@example.no",
        phone: "12345678",
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 3", exact: true }).click();
  await shop.locator("article").filter({ hasText: "Sone 3 døgnkort" }).getByRole("button").click();
  await shop.getByRole("button", { name: /20\. august 2026/ }).click();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("Kari Nordmann");
  await shop.getByLabel("Legg til fiskedato").fill("2026-08-22");
  await shop.getByRole("button", { name: "Legg til dato", exact: true }).click();
  await shop.getByLabel("Kjøp til noen andre").check();
  const angler = shop.getByRole("group", { name: "Fisker – kortet gjelder denne personen" });
  await angler.getByLabel("Fullt navn").fill("Ola Nordmann");
  await angler.getByLabel("Fødselsdato").fill("1991-01-01");
  await angler.getByLabel("E-post").fill("ola@example.no");
  await angler.getByLabel("Telefon").fill("87654321");
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await expect(shop.getByRole("button", { name: "Godkjenn 910 kr" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("multi-day-payment.png") });
  await shop.getByRole("button", { name: "Godkjenn 910 kr" }).click();
  await expect(shop.getByRole("heading", { name: "Betaling godkjent" })).toBeVisible();
  await expect(shop.getByRole("status")).toContainText("2026-08-22");
  await shop.getByRole("button", { name: "Åpne fiskekort" }).click();
  await expect(page.locator(".document-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Regler", exact: true }).click();
  await page.locator(".brand-home").click();
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sans-serif-home.png") });
  await page.reload();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine fiskekort/ }).click();
  await expect(page.locator(".document-card")).toHaveCount(2);
});

test("landowner can assign and revoke a named guest within the parent permit", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "easyfisk-profile-v1",
      JSON.stringify({
        fullName: "Kari Nordmann",
        birthDate: "1990-01-01",
        email: "kari@example.no",
        phone: "12345678",
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine fiskekort/ }).click();
  const access = page.locator(".landowner-access");
  await access.locator("summary").click();
  await access.getByRole("button", { name: "Registrer grunneierkort" }).click();
  await access.getByLabel("Navn på fiskeren *").fill("Kari Nordmann");
  await access.getByLabel("Utsteder / selger *").fill("Lokal test");
  await access.getByLabel("Korttype *").selectOption("Grunneierkort");
  await access.getByLabel("Vassdrag, sone og eventuell delsone *").fill("Mandalselva · Sone 3");
  await access.getByLabel("Gyldig fra (norsk tid) *").fill("2026-08-01T00:00");
  await access.getByLabel("Gyldig til (norsk tid) *").fill("2026-08-31T23:59");
  await access.getByRole("button", { name: "Lagre dokument" }).click();
  await access.getByLabel("Mottakerens navn").fill("Ola Nordmann");
  await access.getByLabel("Mottakerens e-post / bruker").fill("ola@example.no");
  await access.getByLabel("Gyldig fra", { exact: true }).fill("2026-08-20T00:00");
  await access.getByLabel("Gyldig til", { exact: true }).fill("2026-08-22T23:59");
  await access.getByRole("button", { name: "Tildel tilgang lokalt" }).click();
  await expect(access.getByRole("heading", { name: "Ola Nordmann" })).toBeVisible();
  await expect(access.getByText("Gyldig nå", { exact: true })).toBeVisible();
  await access.getByRole("button", { name: "Trekk tilbake tilgang" }).click();
  await expect(access.getByText("Tilbakekalt", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("guest-access.png") });
});
