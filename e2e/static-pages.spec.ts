import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";

interface PageCase {
  path: string;
  /** Expected substring of the visible h1 */
  h1: RegExp;
  /** Path-suffix appended to baseURL — used so we can include query strings */
  query?: string;
}

// /about, /contact, and /welcome are now redirect-only stubs that fold
// into the home one-pager (`app/page.tsx`). Their content is exercised
// by the home-page tests; we only assert the dedicated static-document
// pages here.
const PUBLIC_ROUTES: PageCase[] = [
  { path: "/privacy", h1: /privacy policy/i },
  { path: "/terms", h1: /terms of service/i },
  { path: "/offline", h1: /you[’']re offline/i },
];

// Non-fatal console messages we tolerate (e.g. analytics not configured in
// test env, dev-only React/Next chatter). Anything else is a regression.
const TOLERATED_CONSOLE_PATTERNS: RegExp[] = [
  /Download the React DevTools/,
  /Mixpanel|GA4|gtag/i,
  /\[Fast Refresh\]/,
];

function attachConsoleErrorWatcher(page: Page): { errors: string[] } {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (TOLERATED_CONSOLE_PATTERNS.some((re) => re.test(text))) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  return { errors };
}

test.describe("Public static pages render cleanly", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} loads with the expected h1 and no console errors`, async ({
      page,
    }) => {
      const { errors } = attachConsoleErrorWatcher(page);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("heading", { level: 1, name: route.h1 })
      ).toBeVisible();
      // Lang attribute is set on <html> for screen-reader friendliness.
      await expect(page.locator("html")).toHaveAttribute("lang", /\w+/);
      expect(errors, `Console errors on ${route.path}:\n${errors.join("\n")}`).toEqual(
        []
      );
    });
  }
});

test.describe("Unsubscribe page handles both branches", () => {
  test("no token → manage-preferences message", async ({ page }) => {
    const { errors } = attachConsoleErrorWatcher(page);
    await page.goto("/unsubscribe", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /manage email preferences/i })
    ).toBeVisible();
    await expect(page.getByText(/didn[’']t find an unsubscribe token/i)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("with token → unsubscribing confirmation message", async ({ page }) => {
    const { errors } = attachConsoleErrorWatcher(page);
    await page.goto("/unsubscribe?token=test-token-abc", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { level: 1, name: /you[’']re unsubscribing/i })
    ).toBeVisible();
    await expect(page.getByText(/we[’']ve received your request/i)).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("Not-found page", () => {
  test("renders the 404 brand page on an unknown route", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: /can[’']t find that page/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /^home$/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /browse designers/i })
    ).toBeVisible();
  });
});

test.describe("Static-page table-of-contents links jump to anchors", () => {
  test("Privacy page TOC link scrolls to its section", async ({ page }) => {
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    // The "On this page" TOC links each go to a #section anchor.
    const link = page.getByRole("link", { name: /your rights/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    // After click, the URL fragment should match the target section id.
    await expect(page).toHaveURL(/#rights$/);
  });

  test("Terms page TOC link scrolls to its section", async ({ page }) => {
    await page.goto("/terms", { waitUntil: "domcontentloaded" });
    const link = page.getByRole("link", { name: /prohibited conduct/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/#prohibited$/);
  });
});
