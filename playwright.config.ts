import { defineConfig } from "@playwright/test";
import { TEST_GUIDE_STORAGE_KEY, TEST_GUIDE_VERSION } from "./features/test-guide/guide-version";

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3000",
    colorScheme: "light",
    // Existing journeys start after onboarding. test-guide.spec.ts uses a fresh visitor.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://127.0.0.1:3000",
          localStorage: [{ name: TEST_GUIDE_STORAGE_KEY, value: TEST_GUIDE_VERSION }],
        },
      ],
    },
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
