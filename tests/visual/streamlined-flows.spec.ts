import { expect, test } from "@playwright/test";
test.use({ viewport: { width: 390, height: 844 } });
test("profile prefills buyer and documents; checkout goes directly to Vipps", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.locator(".more-profile-card").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Fullt navn").fill("Profil Fisker");
  await dialog.getByLabel("Fødselsdato").fill("1990-05-12");
  await dialog.getByLabel("E-post").fill("profil@example.no");
  await dialog.getByLabel("Telefon", { exact: true }).fill("98765432");
  await dialog.getByRole("button", { name: "Lagre profil" }).click();
  await expect(dialog.getByText("Profilen er lagret", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
  await dialog.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
  await expect(dialog.getByLabel("Navn på fiskeren *")).toHaveValue("Profil Fisker");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByLabel("Dato", { exact: true }).fill("2026-08-20");
  await shop.locator("article").filter({ hasText: "Sone 3 døgnkort" }).getByRole("button").click();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("Profil Fisker");
  await expect(shop.getByLabel("E-post")).toHaveValue("profil@example.no");
  await expect(shop.getByRole("heading", { name: "Kontroller bestillingen" })).toBeVisible();
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await expect(shop.getByRole("heading", { name: "Godkjenn betaling" })).toBeVisible();
  await shop.getByRole("button", { name: "Godkjenn 455 kr" }).click();
  await expect(shop.getByRole("heading", { name: "Betaling godkjent" })).toBeVisible();
});
test("single catch form saves and real corrections survive reload with history", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("easyfisk:fishing-log:v1"))
      localStorage.setItem(
        "easyfisk:fishing-log:v1",
        JSON.stringify({
          version: 2,
          activeSession: { startTime: Date.parse("2026-08-20T16:00:00Z"), zone: 3 },
          sessions: [],
          catches: [],
        }),
      );
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Registrer fangst", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await dialog.getByRole("button", { name: "Avlivet", exact: true }).click();
  await dialog.getByPlaceholder("cm").fill("60");
  await dialog.getByPlaceholder("kg").fill("3");
  await dialog.getByRole("button", { name: "Lagre fangst", exact: true }).click();
  await dialog.getByRole("button", { name: "Ferdig", exact: true }).click();
  await page.locator(".home-trip-summary").click();
  await page.locator(".catch-history-card").first().click();
  const detail = page.getByRole("dialog");
  await detail.getByRole("button", { name: "Rett fangsten" }).click();
  await detail.getByRole("combobox", { name: "Resultat", exact: true }).selectOption("Gjenutsatt");
  await detail.getByLabel("Vekt (kg)").fill("3.2");
  await detail.getByLabel("Hvorfor retter du fangsten?").fill("Valgte feil resultat og vekt");
  await detail.getByRole("button", { name: "Lagre rettelse", exact: true }).click();
  await expect(detail.getByRole("heading", { name: /Laks · gjenutsatt/i })).toBeVisible();
  await expect(detail.getByText("60 cm · 3.2 kg", { exact: true })).toBeVisible();
  await page.reload();
  const record = await page.evaluate(
    () => JSON.parse(localStorage.getItem("easyfisk:fishing-log:v1")!).catches[0],
  );
  expect(record.result).toBe("Gjenutsatt");
  expect(record.weight).toBe(3.2);
  expect(record.revisions[0].before.result).toBe("Avlivet");
});
test("buying the last available permit updates the calendar after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 2", exact: true }).click();
  await shop.getByLabel("Dato", { exact: true }).fill("2026-08-20");
  await shop.locator("article").filter({ hasText: "Heia døgnkort" }).getByRole("button").click();
  await expect(shop.locator("strong.permit-availability")).toHaveText("1 kort igjen denne datoen");
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await shop.getByLabel("Fullt navn").fill("Kapasitet Fisker");
  await shop.getByLabel("Fødselsdato").fill("1990-05-12");
  await shop.getByLabel("E-post").fill("kapasitet@example.no");
  await shop.getByLabel("Telefon").fill("98765432");
  await shop.getByLabel(/Jeg har lest og forstått/).check();
  await shop.getByLabel(/Jeg godtar vilkårene/).check();
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof original>) {
      if (this.name === "documents") {
        IDBObjectStore.prototype.put = original;
        throw new DOMException("Full", "QuotaExceededError");
      }
      return original.apply(this, args);
    };
  });
  await shop.getByRole("button", { name: "Godkjenn 100 kr" }).click();
  await expect(shop.locator(".permit-payment-result.error")).toBeVisible();
  await expect(shop.getByText("Kladd lagret", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("Kapasitet Fisker");
  await shop.getByRole("button", { name: "Betal med Vipps" }).click();
  await shop.getByRole("button", { name: "Godkjenn 100 kr" }).click();
  await expect(shop.getByRole("heading", { name: "Betaling godkjent" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(shop.locator("strong.permit-availability")).toHaveText("Utsolgt denne datoen");
  await expect(shop.getByRole("button", { name: "Fortsett til kjøp" })).toBeDisabled();
});
