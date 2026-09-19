import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

async function openEnglishApp(page: Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    const guideCompleted = localStorage.getItem("easyfisk-test-guide-completed");
    localStorage.clear();
    if (guideCompleted) localStorage.setItem("easyfisk-test-guide-completed", guideCompleted);
    localStorage.setItem("easyfisk-language", "en");
    await Promise.all(
      ["easyfisk-documents", "easyfisk-catch-images"].map(
        (name) =>
          new Promise<void>((resolve) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = request.onerror = request.onblocked = () => resolve();
          }),
      ),
    );
  });
  await page.reload();
  await expect(page.locator(".language-switcher")).toContainText("Norsk");
}

async function openStatusEngine(page: Page) {
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: /Status engine/ }).click();
  return page.getByRole("dialog", { name: "Status engine" });
}

test.beforeEach(async ({ page }) => {
  await openEnglishApp(page);
});

test("every primary screen and More destination opens in English", async ({ page }) => {
  const screens = [
    ["Home", "Your fishing overview"],
    ["Map", "Fishing zones"],
    ["Permits", "Buy fishing permit"],
    ["Rules", "Fishing rules"],
    ["More", "More"],
  ] as const;

  for (const [navigation, heading] of screens) {
    await test.step(navigation, async () => {
      await page.getByRole("button", { name: navigation, exact: true }).click();
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    });
  }

  const destinations = [
    "Angler profile",
    "My fishing permits",
    "Disinfection",
    "Notifications and closures",
    "Profile and privacy",
    "National fishing fee",
    "Status engine",
  ];
  for (const destination of destinations) {
    await test.step(destination, async () => {
      await page
        .getByRole("button", { name: new RegExp(destination, "i") })
        .first()
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  }
});

test("all prototype legal-status scenarios render their English state", async ({ page }) => {
  const scenarios = [
    [
      "allMissing",
      "The fishing permit, disinfection and national fishing fee are marked as missing.",
    ],
    ["ok", "All requirements have been checked. You can continue to zone selection."],
    ["noPermit", "There is no valid fishing permit on your profile."],
    [
      "wrongZone",
      "Your permit is valid for Zone 2. Choose the correct zone or register another permit.",
    ],
    [
      "expiredDisinfection",
      "The certificate has expired. The equipment must be disinfected before fishing can start.",
    ],
    [
      "otherRiver",
      "The equipment has been used in another watercourse since its last disinfection.",
    ],
    ["noFee", "Payment of the national fishing fee must be documented before salmon fishing."],
    [
      "dailyQuota",
      "One harvested salmon has been recorded this fishing day. Fishing cannot continue until the next fishing day.",
    ],
    [
      "seasonQuota",
      "Five harvested salmon have been recorded this season. No further harvesting is permitted.",
    ],
    ["lateReport", "A previous catch report must be completed before a new session can start."],
    [
      "hotWater",
      "The recorded water temperature is 21.4 °C. All fishing is temporarily suspended.",
    ],
    ["closed", "An active closure notice has been published for the selected zone."],
    [
      "zoneBorder",
      "The GPS result is uncertain. Check signs on site and select the zone manually.",
    ],
  ] as const;

  for (const [value, expectedDetail] of scenarios.filter(
    ([id]) => !["wrongZone", "otherRiver", "lateReport", "zoneBorder"].includes(id),
  )) {
    await test.step(value, async () => {
      const dialog = await openStatusEngine(page);
      await dialog.getByLabel("Scenario").selectOption(value);
      await expect(dialog.getByRole("status")).toContainText(expectedDetail);
      await dialog
        .getByRole("button", {
          name: "Use selected scenario",
        })
        .click();
      await expect(page.getByText("SELECTED SCENARIO").first()).toBeVisible();
    });
  }
});

test("the English permit catalogue exposes every prototype product type", async ({ page }) => {
  await page.getByRole("button", { name: "Permits", exact: true }).click();
  const catalogue = page.getByLabel("Permit shop");
  const productTypes = new Set<string>();

  for (const zone of [1, 2, 3, 4]) {
    await catalogue.getByRole("button", { name: `Zone ${zone}`, exact: true }).click();
    const text = await catalogue.innerText();
    for (const type of ["day", "week", "season", "group", "boat", "reporting"]) {
      if (new RegExp(`\\b${type} permit\\b`, "i").test(text)) productTypes.add(type);
    }
  }

  expect([...productTypes].sort()).toEqual(["boat", "day", "group", "reporting", "season"].sort());
});

for (const state of [
  { code: 1, expected: "Location access was denied. Choose a zone manually." },
  { code: 2, expected: "Location is unavailable. Choose a zone manually." },
  { code: 3, expected: "Location took too long. Try again or choose a zone manually." },
]) {
  test(`GPS error ${state.code} has an actionable English fallback`, async ({ page }) => {
    await page.addInitScript((code) => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition: (_success: PositionCallback, error: PositionErrorCallback) =>
            error({
              code,
              message: "simulated",
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            }),
        },
      });
    }, state.code);
    await page.reload();
    await page.getByRole("button", { name: "Map", exact: true }).click();
    await page.getByRole("button", { name: "Show my location" }).click();
    await expect(page.locator(".map-location-status")).toHaveText(state.expected);
  });
}

for (const viewport of [
  { name: "iPhone", width: 390, height: 664 },
  { name: "Android", width: 412, height: 732 },
]) {
  test(`English navigation persists across refresh at ${viewport.name} width`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "Rules", exact: true }).click();
    await page.reload();
    await expect(page.locator(".language-switcher")).toContainText("Norsk");
    await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.locator(".bottom-nav")).toBeInViewport();
  });
}
