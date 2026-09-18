import { expect, test } from "@playwright/test";
test("personal subzone rules and disclosures work on mobile", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("easyfisk-documents", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("documents", { keyPath: "id" });
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("documents", "readwrite");
      tx.objectStore("documents").put({
        id: "personal-rules-test",
        kind: "permit",
        updatedAt: 1,
        values: {
          holder: "Test Fisker",
          issuer: "EasyFisk",
          category: "Døgnkort",
          area: "Mandalselva · Sone 4 · Laksehylen",
          startsAt: "2026-08-20T18:00",
          endsAt: "2026-08-21T17:59",
        },
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload();
  await page.getByRole("button", { name: "Regler", exact: true }).click();
  await expect(page.locator(".personal-local-rules")).toContainText("Fiskeforbud 50 meter");
  await expect(page.locator(".personal-rule-list").first()).toContainText("1. juni–15. september");
  await expect(
    page.getByText("Midtsesongevalueringen er innarbeidet", { exact: true }),
  ).not.toBeVisible();
  await page.screenshot({ path: info.outputPath("personal-rules-mobile.png") });
  await page.getByText("Flere regler og områdeinformasjon", { exact: true }).click();
  await expect(page.getByRole("link", { name: "Se vilkårene for ditt fiskekort" })).toBeVisible();
  await page.getByText("Kilder og oppdateringer", { exact: true }).click();
  await expect(
    page.getByText("Midtsesongevalueringen er innarbeidet", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByText("Sources and updates", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
});
