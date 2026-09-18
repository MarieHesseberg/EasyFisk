import { expect, test, type Page } from "@playwright/test";
async function compose(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Meld fra til elveeigarlaget/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Annet", exact: true }).click();
  await dialog.getByRole("textbox").fill("Forsøpling ved elvebredden, ved den store steinen.");
  return dialog;
}
test("message, actual coordinates, image and reference persist after reload", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().grantPermissions(["geolocation"]);
  await page.context().setGeolocation({ latitude: 58.24, longitude: 7.52 });
  const dialog = await compose(page);
  await dialog.locator("input[type=file]").setInputFiles({
    name: "observasjon.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await dialog.getByRole("button", { name: "Legg til min posisjon" }).click();
  await expect(dialog.getByText(/58.24000, 7.52000/)).toBeVisible();
  await dialog.getByRole("button", { name: "Kontroller meldingen" }).click();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Lagre melding" }).evaluate((b: HTMLButtonElement) => {
    b.click();
    b.click();
  });
  await expect(dialog.getByText("Meldingen er lagret", { exact: true })).toBeVisible();
  const reference = await dialog.locator("dd").first().innerText();
  await dialog.getByRole("button", { name: "Åpne Mine innmeldinger" }).click();
  await expect(dialog.locator(".feedback-history-item")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine innmeldinger/ }).click();
  await page.locator(".feedback-history-item summary").click();
  await expect(page.locator(".feedback-history-item")).toContainText(reference);
  await expect(page.locator(".feedback-message-detail")).toContainText("58.24000, 7.52000");
  await expect(page.locator(".feedback-saved-image")).toBeVisible();
  expect(
    await page
      .locator(".feedback-saved-image")
      .evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBe(1);
  await page.screenshot({ path: info.outputPath("saved-message.png") });
  await page.getByRole("button", { name: "Slett innmelding", exact: true }).click();
  await page.getByRole("button", { name: "Ja, slett innmelding", exact: true }).click();
  await expect(page.locator(".feedback-history-item")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Mine innmeldinger/ }).click();
  await expect(page.locator(".feedback-history-item")).toHaveCount(0);

  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
});
test("denied GPS and failed storage preserve form and allow a single successful retry", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: unknown, error: (e: unknown) => void) =>
          error({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 }),
      },
    }),
  );
  const dialog = await compose(page);
  await dialog.getByRole("button", { name: "Legg til min posisjon" }).click();
  await expect(
    dialog.getByRole("status").filter({ hasText: "Posisjonstilgang ble avslått" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Kontroller meldingen" }).click();
  await dialog.getByRole("checkbox").check();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof original>) {
      if (this.name === "messages") {
        IDBObjectStore.prototype.put = original;
        throw new DOMException("No space", "QuotaExceededError");
      }
      return original.apply(this, args);
    };
  });
  await dialog.getByRole("button", { name: "Lagre melding" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Opplysningene er bevart");
  await expect(dialog.getByText("Meldingen er lagret", { exact: true })).toHaveCount(0);
  await expect(dialog).toContainText("Forsøpling ved elvebredden");
  await dialog.getByRole("button", { name: "Lagre melding" }).click();
  await expect(dialog.getByText("Meldingen er lagret", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Åpne Mine innmeldinger" }).click();
  await expect(dialog.locator(".feedback-history-item")).toHaveCount(1);
});
