import { expect, test } from "@playwright/test";

for (const timezoneId of ["America/Los_Angeles", "Asia/Tokyo"]) {
  test.describe(`Norwegian fishing times on a phone in ${timezoneId}`, () => {
    test.use({ timezoneId, viewport: { width: 390, height: 844 } });

    test("legacy permit shows Today and a past trip stores the Norwegian instant", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
      await page.evaluate(async () => {
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.open("easyfisk-documents", 1);
          request.onupgradeneeded = () =>
            request.result.createObjectStore("documents", { keyPath: "id" });
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("documents", "readwrite");
            tx.objectStore("documents").put({
              id: "legacy-time-test",
              kind: "permit",
              updatedAt: 1,
              values: {
                holder: "Test Fisker",
                issuer: "Demo",
                category: "Døgnkort",
                area: "Mandalselva · Sone 3",
                startsAt: "2026-08-20T18:00",
                endsAt: "2026-08-21T17:59",
              },
            });
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onabort = () => {
              db.close();
              reject(tx.error);
            };
          };
        });
      });
      await page.reload();
      await expect(page.locator(".home-ticket-label")).toHaveText("I dag");
      await page.getByRole("button", { name: /Registrer tidligere fisketur/ }).click();
      const dialog = page.getByRole("dialog", { name: "Registrer tidligere fisketur" });
      await dialog.locator("input[type=date]").fill("2026-08-19");
      await dialog.getByLabel(/Starttid/).fill("17:00");
      await dialog.getByLabel(/Sluttid/).fill("19:00");
      await dialog.getByRole("button", { name: "Neste · regelkontroll" }).click();
      await dialog
        .getByRole("button", { name: /registrer.*tur|send.*rapport|lagre.*tur/i })
        .click();
      await expect(dialog).toContainText("Tur og fangster er registrert");
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("easyfisk:fishing-log:v1")!).sessions[0],
      );
      expect(saved.start).toBe(Date.parse("2026-08-19T15:00Z"));
      expect(saved.end).toBe(Date.parse("2026-08-19T17:00Z"));
      expect(saved.duration).toBe(7200);
      expect(saved.zoneId).toBe(3);
      await page.reload();
      const restored = await page.evaluate(
        () => JSON.parse(localStorage.getItem("easyfisk:fishing-log:v1")!).sessions[0],
      );
      expect(restored.id).toBe(saved.id);
    });
  });
}
