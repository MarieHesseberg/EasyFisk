import { expect, test, type Page } from "@playwright/test";
async function openReset(page: Page) {
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Slett og tilbakestill/ }).click();
  return page.getByRole("dialog", { name: "Slett og tilbakestill" });
}
test.use({ viewport: { width: 390, height: 844 } });
test("notifications are readable, marked read across screens/reloads, and new notices light the dot", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.locator(".round-btn i")).toBeVisible();
  await page.getByRole("button", { name: "Varsler", exact: true }).click();
  const notices = page.locator(".header-alert-panel");
  await expect(notices).toContainText("Oppdaterte fiskeregler");
  await expect(notices).not.toContainText("Eksempelkort");
  expect(
    await notices
      .locator("p")
      .first()
      .evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  await expect(page.locator(".round-btn i")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("readable-notices.png") });
  await page.getByRole("button", { name: "Lukk varsler" }).click();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await expect(page.locator(".round-btn i")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".round-btn i")).toHaveCount(0);
  await page.evaluate(() =>
    localStorage.setItem("easyfisk-clock-v1", String(Date.now() - 7 * 86400000)),
  );
  await page.reload();
  await expect(page.locator(".round-btn i")).toBeVisible();
});

test("full reset clears every user store, drafts and active session, preserves unrelated data and permits fresh writes", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.evaluate(async () => {
    localStorage.setItem("unrelated-site", "keep");
    localStorage.setItem(
      "easyfisk-profile-v1",
      JSON.stringify({
        fullName: "Reset User",
        birthDate: "1990-01-01",
        email: "reset@example.no",
        phone: "12345678",
      }),
    );
    localStorage.setItem(
      "easyfisk:fishing-log:v1",
      JSON.stringify({
        version: 2,
        catches: [],
        sessions: [],
        activeSession: { startTime: Date.parse("2026-08-20T16:05:00Z"), zone: 3 },
      }),
    );
    localStorage.setItem("easyfisk:permit-purchases:v1", "[]");
    localStorage.setItem("easyfisk-rule-acceptances-v1", "[]");
    localStorage.setItem("easyfisk-read-notices-v1", "[]");
    sessionStorage.setItem("easyfisk-test-session", "erase");
    for (const [name, store] of [
      ["easyfisk-documents", "documents"],
      ["easyfisk-feedback", "messages"],
      ["easyfisk-drafts", "drafts"],
      ["easyfisk-catch-images", "images"],
    ]) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(name, 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore(
            store,
            ["documents", "messages"].includes(store) ? { keyPath: "id" } : undefined,
          );
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(store, "readwrite");
          if (["documents", "messages"].includes(store))
            tx.objectStore(store).put({ id: "reset-test" });
          else tx.objectStore(store).put({ test: true }, "reset-test");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      });
    }
  });
  await page.reload();
  const dialog = await openReset(page);
  await dialog.getByRole("button", { name: "Slett og tilbakestill", exact: true }).click();
  await dialog.getByRole("button", { name: "Avbryt", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("easyfisk-profile-v1"))).toContain(
    "Reset User",
  );
  await dialog.getByRole("button", { name: "Slett og tilbakestill", exact: true }).click();
  await dialog.getByRole("button", { name: "Ja, slett og tilbakestill" }).click();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(page.locator(".prototype-shell")).toHaveAttribute("data-ready", "true");
  const data = await page.evaluate(async () => {
    const counts: number[] = [];
    for (const [name, store] of [
      ["easyfisk-documents", "documents"],
      ["easyfisk-feedback", "messages"],
      ["easyfisk-drafts", "drafts"],
      ["easyfisk-catch-images", "images"],
    ]) {
      counts.push(
        await new Promise<number>((resolve, reject) => {
          const request = indexedDB.open(name);
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(store);
            const count = tx.objectStore(store).count();
            tx.oncomplete = () => {
              db.close();
              resolve(count.result);
            };
            tx.onerror = () => reject(tx.error);
          };
        }),
      );
    }
    return {
      counts,
      profile: localStorage.getItem("easyfisk-profile-v1"),
      log: localStorage.getItem("easyfisk:fishing-log:v1"),
      other: localStorage.getItem("unrelated-site"),
      session: sessionStorage.getItem("easyfisk-test-session"),
    };
  });
  expect(data).toEqual({
    counts: [0, 0, 0, 0],
    profile: null,
    log: null,
    other: "keep",
    session: null,
  });
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("neutral-home.png") });
  await page.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
  const fee = page.getByRole("dialog");
  await fee.getByRole("button", { name: "Registrer statlig fiskeravgift", exact: true }).click();
  await fee.getByLabel("Navn på fiskeren *").fill("New User");
  await fee.getByLabel("Avgift / fritak *").selectOption("Under 18 år – fritak");
  await fee.getByRole("button", { name: "Lagre dokument" }).click();
  await expect(fee.getByRole("heading", { name: "New User" })).toBeVisible();
});

test("status menu excludes irrelevant simulations and previewing does not activate a scenario", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  const settings = page.getByRole("dialog", { name: "Statusmotor" });
  for (const id of [
    "zoneInside",
    "zoneOutside",
    "zoneBorder",
    "otherRiver",
    "lateReport",
    "wrongZone",
  ])
    await expect(settings.locator(`option[value="${id}"]`)).toHaveCount(0);
  await settings.getByLabel("Situasjon", { exact: true }).selectOption("ok");
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  await settings.getByRole("button", { name: /bruk valgt situasjon/i }).click();
  await expect(page.getByRole("button", { name: "Start fiske", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: /Statusmotor/ }).click();
  await settings.getByRole("button", { name: /Avslutt testmodus/ }).click();
  await page.getByRole("button", { name: "Hjem", exact: true }).click();
  await expect(page.getByRole("button", { name: "Kjøp fiskekort", exact: true })).toBeVisible();
});

test("failed reset reports failure and can be retried without claiming success", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "easyfisk-profile-v1",
      JSON.stringify({
        fullName: "Keep until reset",
        birthDate: "1990-01-01",
        email: "test@example.no",
        phone: "12345678",
      }),
    );
    const original = indexedDB.open.bind(indexedDB);
    Object.defineProperty(window, "restoreResetStorage", {
      value: () => {
        indexedDB.open = original;
      },
    });
    indexedDB.open = ((name: string, version?: number) => {
      if (name === "easyfisk-catch-images") throw new Error("Simulated storage failure");
      return version === undefined ? original(name) : original(name, version);
    }) as typeof indexedDB.open;
  });
  const dialog = await openReset(page);
  await dialog.getByRole("button", { name: "Slett og tilbakestill", exact: true }).click();
  await dialog.getByRole("button", { name: "Ja, slett og tilbakestill" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Tilbakestillingen ble ikke fullført" }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("easyfisk-profile-v1"))).toContain(
    "Keep until reset",
  );
  await page.evaluate(() =>
    (window as unknown as { restoreResetStorage: () => void }).restoreResetStorage(),
  );
  await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(page.locator(".prototype-shell")).toHaveAttribute("data-ready", "true");
  expect(await page.evaluate(() => localStorage.getItem("easyfisk-profile-v1"))).toBeNull();
});

test("resetting fishing history preserves profile and other site data", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "easyfisk-profile-v1",
      JSON.stringify({
        fullName: "Preserved User",
        birthDate: "1990-01-01",
        email: "test@example.no",
        phone: "12345678",
      }),
    );
    localStorage.setItem(
      "easyfisk:fishing-log:v1",
      JSON.stringify({ version: 2, catches: [], sessions: [], activeSession: null }),
    );
  });
  const dialog = await openReset(page);
  await dialog.getByLabel("Hva vil du tilbakestille?").selectOption("fishing");
  await dialog.getByRole("button", { name: "Slett og tilbakestill", exact: true }).click();
  await dialog.getByRole("button", { name: "Ja, slett og tilbakestill" }).click();
  await expect(page.getByRole("heading", { name: "Din fiskeoversikt" })).toBeVisible();
  await expect(page.locator(".prototype-shell")).toHaveAttribute("data-ready", "true");
  expect(await page.evaluate(() => localStorage.getItem("easyfisk:fishing-log:v1"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("easyfisk-profile-v1"))).toContain(
    "Preserved User",
  );
});
