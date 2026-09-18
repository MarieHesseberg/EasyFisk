import { expect, test } from "@playwright/test";
test.use({ viewport: { width: 390, height: 844 } });
test("message draft retains text and image across tabs and reload, and can be discarded", async ({
  page,
}) => {
  await page.goto("/");
  const open = async () =>
    page.getByRole("button", { name: /Meld fra til elveeigarlaget/ }).click();
  await open();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Annet", exact: true }).click();
  await dialog.getByRole("textbox").fill("Dette er en melding som skal bevares.");
  await dialog.locator("input[type=file]").setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(dialog.getByText("Kladd lagret", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await open();
  await expect(dialog.getByRole("textbox")).toHaveValue("Dette er en melding som skal bevares.");
  await page.reload();
  await open();
  await expect(dialog.getByRole("textbox")).toHaveValue("Dette er en melding som skal bevares.");
  await page.screenshot({ path: "tmp/pdfs/draft-mobile.png" });
  await expect(dialog).toContainText("test.png");
  await dialog.getByRole("button", { name: "Forkast kladd" }).click();
  await expect(dialog.getByRole("textbox")).toHaveValue("");
  await page.reload();
  await open();
  await expect(dialog.getByRole("textbox")).toHaveValue("");
});
test("purchase draft resumes selected product and buyer after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  const shop = page.locator(".permit-shop-screen");
  await shop.getByRole("button", { name: "Sone 3", exact: true }).click();
  await shop.locator("article").filter({ hasText: "Sone 3 døgnkort" }).getByRole("button").click();
  await shop.getByRole("button", { name: "Fortsett til kjøp" }).click();
  await shop.getByLabel("Fullt navn").fill("Kladd Fisker");
  await shop.getByLabel("E-post").fill("kladd@example.no");
  await expect(shop.getByText("Kladd lagret", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("Kladd Fisker");
  await expect(shop.getByLabel("E-post")).toHaveValue("kladd@example.no");
  await shop.getByRole("button", { name: "Forkast kladd" }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("");
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await expect(shop.getByLabel("Fullt navn")).toHaveValue("");
});
test("document draft restores its fields after a reload", async ({ page }) => {
  await page.goto("/");
  const open = async () => {
    await page.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true })
      .click();
  };
  await open();
  await page.getByLabel("Navn på fiskeren *").fill("Dokumentkladd");
  await expect(page.getByText("Kladd lagret", { exact: true })).toBeVisible();
  await page.reload();
  await open();
  await expect(page.getByLabel("Navn på fiskeren *")).toHaveValue("Dokumentkladd");
});
test("catch draft resumes its step and measurements, then clears on completion", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  await page
    .getByRole("dialog", { name: "Statusmotor" })
    .getByLabel("Situasjon")
    .selectOption("ok");
  await page
    .getByRole("dialog", { name: "Statusmotor" })
    .getByRole("button", { name: /bruk valgt situasjon/i })
    .click();
  await page.getByRole("button", { name: "START FISKE", exact: true }).click();
  await page.getByRole("button", { name: "Velg sone manuelt" }).click();
  await page.getByRole("button", { name: "Start fiske i Sone 3" }).click();
  await page.getByRole("button", { name: "Registrer fangst", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Registrer fangst" });
  await dialog.getByPlaceholder("cm").fill("65");
  await dialog.getByPlaceholder("kg").fill("3");
  await expect(dialog.getByText("Kladd lagret", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Registrer fangst", exact: true }).click();
  await expect(dialog.getByPlaceholder("cm")).toHaveValue("65");
  await expect(dialog.getByPlaceholder("kg")).toHaveValue("3");
  await dialog.getByRole("button", { name: "Lagre fangst" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Fangsten er lagret på denne enheten" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await page.getByRole("button", { name: "Registrer fangst", exact: true }).click();
  await expect(dialog.getByPlaceholder("cm")).toHaveValue("");
});
test("past trip retains date and area across reload", async ({ page }) => {
  await page.goto("/");
  const open = async () => page.getByRole("button", { name: /Glemt å trykke start/ }).click();
  await open();
  const dialog = page.getByRole("dialog");
  await dialog.locator("input[type=date]").fill("2026-08-18");
  await dialog.getByLabel(/Hovedsone/).selectOption("4");
  await dialog.getByLabel(/Delsone/).selectOption("Bjåhylen");
  await expect(dialog.getByText("Kladd lagret", { exact: true })).toBeVisible();
  await page.reload();
  await open();
  await expect(dialog.locator("input[type=date]")).toHaveValue("2026-08-18");
  await expect(dialog.getByLabel(/Delsone/)).toHaveValue("Bjåhylen");
});
test("buying from the map uses the newly selected zone instead of a restored journey", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Fiskekort", exact: true }).click();
  await page
    .locator(".permit-shop-screen")
    .getByRole("button", { name: "Sone 3", exact: true })
    .click();
  await page.getByRole("button", { name: "Kart", exact: true }).click();
  await page.getByRole("button", { name: "Sone 1", exact: true }).click();
  await page.getByRole("button", { name: /Kjøp fiskekort i sone 1/i }).click();
  await expect(
    page.locator(".permit-shop-screen").getByRole("button", { name: "Sone 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("draft write failures are visible and editing remains possible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Meld fra til elveeigarlaget/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox")).toBeVisible();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof original>) {
      if (this.name === "drafts") throw new DOMException("Full", "QuotaExceededError");
      return original.apply(this, args);
    };
  });
  await dialog.getByRole("textbox").fill("Denne kladden kan ikke lagres ennå.");
  await expect(dialog.getByRole("alert")).toContainText("Kunne ikke lagre kladden");
  await expect(dialog.getByRole("textbox")).toHaveValue("Denne kladden kan ikke lagres ennå.");
});
