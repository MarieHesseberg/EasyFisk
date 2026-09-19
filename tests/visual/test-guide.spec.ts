import { expect, test, type Page } from "@playwright/test";
import {
  TEST_GUIDE_STORAGE_KEY,
  TEST_GUIDE_VERSION,
} from "../../features/test-guide/guide-version";

test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 390, height: 844 } });

async function readGuide(page: Page) {
  const guide = page.getByRole("dialog", {
    name: /Hjelp meg|Prøv ulike|Her ligger|Dette kan|Alle tilbake/,
  });
  await guide.getByRole("button", { name: "Neste", exact: true }).click();
  await expect(guide.getByRole("button", { name: "Neste", exact: true })).toHaveCount(0);
  await guide.getByRole("button", { name: "Vis meg hvor" }).click();
  const target = page.locator("[data-status-engine-entry]");
  await expect(target).toHaveClass(/test-guide-highlight/);
  const targetBox = await target.boundingBox();
  const windowBox = await page.locator(".test-guide-location-window").boundingBox();
  expect(targetBox!.y).toBeGreaterThanOrEqual(windowBox!.y - 1);
  expect(targetBox!.y + targetBox!.height).toBeLessThanOrEqual(
    windowBox!.y + windowBox!.height + 1,
  );
  await guide.getByRole("button", { name: "Neste", exact: true }).click();
  await expect(guide).toContainText("Ingen penger trekkes");
  await guide.getByRole("button", { name: "Neste", exact: true }).click();
  await expect(guide).toContainText("Send notatene til den som ga deg lenken");
  await guide.getByRole("button", { name: "Test appen", exact: true }).click();
  await expect(guide).toHaveCount(0);
}

test("first visit is gated, shows the real menu location, remembers completion and can be replayed", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("dialog")).toContainText("Hjelp meg å gjøre EasyFisk bedre");
  await expect(page.locator(".app-content")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Test appen", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  await readGuide(page);
  expect(await page.evaluate((key) => localStorage.getItem(key), TEST_GUIDE_STORAGE_KEY)).toBe(
    TEST_GUIDE_VERSION,
  );
  await page.reload();
  await expect(page.locator(".prototype-shell")).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.getByRole("button", { name: "Slik tester du appen" }).click();
  await readGuide(page);
  await page.getByRole("button", { name: "Mer", exact: true }).click();
  await page.locator("[data-status-engine-entry]").click();
  await page
    .getByRole("dialog", { name: "Statusmotor", exact: true })
    .getByLabel("Situasjon", { exact: true })
    .selectOption("ok");
  await page.getByRole("button", { name: "Bruk valgt situasjon" }).click();
  await expect(page.getByRole("button", { name: "Start fiske", exact: true })).toBeVisible();
});

test("an old completion version triggers the guide without clearing existing data", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(key, "older-version");
      localStorage.setItem("easyfisk-profile-v1", JSON.stringify({ fullName: "Existing tester" }));
    },
    { key: TEST_GUIDE_STORAGE_KEY },
  );
  await page.goto("/");
  await readGuide(page);
  expect(await page.evaluate(() => localStorage.getItem("easyfisk-profile-v1"))).toContain(
    "Existing tester",
  );
});

test("English guide, keyboard containment and desktop panel", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const guide = page.getByRole("dialog");
  await guide.getByRole("button", { name: "Switch to English" }).click();
  await expect(guide).toContainText("Help me improve EasyFisk");
  await guide.getByRole("button", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(guide.getByRole("button", { name: "Bytt til norsk" })).toBeFocused();
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await guide.getByRole("button", { name: "Show me where" }).click();
  await expect(guide).toContainText("Here is the status engine");
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await expect(guide).toContainText("Quotas and closures");
  await guide.getByRole("button", { name: "Previous" }).click();
  await guide.getByRole("button", { name: "Show me where" }).click();
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await guide.getByRole("button", { name: "Next", exact: true }).click();
  await guide.getByRole("button", { name: "Test the app", exact: true }).click();
  const panel = page.getByRole("complementary");
  await expect(panel.getByRole("heading", { name: "Try a fishing trip" })).toBeVisible();
  await panel.getByLabel("Scenario", { exact: true }).selectOption("dailyQuota");
  await expect(panel).toContainText("Blocks fishing start");
  await page.screenshot({ path: info.outputPath("desktop-test-panel.png") });
});

test("small screen and enlarged text remain scrollable; failed guide storage does not trap the tester", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(
    ({ key }) => {
      const save = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key) throw new DOMException("Storage unavailable", "QuotaExceededError");
        return save.call(this, name, value);
      };
    },
    { key: TEST_GUIDE_STORAGE_KEY },
  );
  await page.goto("/");
  await page.addStyleTag({ content: ".test-guide { font-size: 32px; }" });
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.locator(".test-guide").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("small-guide.png") });
  // Large text can make the location window scroll; the guide must still be completable.
  const guide = page.getByRole("dialog");
  await guide.getByRole("button", { name: "Neste", exact: true }).click();
  await guide.getByRole("button", { name: "Vis meg hvor" }).click();
  await guide.getByRole("button", { name: "Neste", exact: true }).click();
  await guide.getByRole("button", { name: "Neste", exact: true }).click();
  await guide.getByRole("button", { name: "Test appen", exact: true }).click();
  await expect(guide).toHaveCount(0);
  await page.getByRole("button", { name: "Mer", exact: true }).click();
});
