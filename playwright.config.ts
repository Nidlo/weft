import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Single worker. Parallel browser contexts thrashed CPU + caused
  // intermittent hydration / nav timeouts on the unsubscribe page (Suspense
  // + useSearchParams). The full suite still runs in ~11s serialized, so
  // there's no real cost to giving up parallelism here.
  workers: 1,
  reporter: "html",
  // Public surfaces don't depend on the backend; default to DOM-ready
  // navigation so a hanging CSRF fetch in the auth provider can't stall the
  // suite. Tests that need network-quiet can opt in with their own waitUntil.
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  // Use the production build for E2E so pages aren't compiled on first
  // request (dev-mode first-load compile blew past Playwright's 30s nav
  // timeout). The webServer command builds + starts in one step.
  webServer: {
    command: "yarn build && yarn start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
