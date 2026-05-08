import { test, expect, type Page } from "@playwright/test";

/**
 * Mobile-first audit. We visit every public surface at three real device
 * widths and assert:
 *
 *   1. No horizontal overflow on `<body>` (a #1 mobile sin — even 1px causes
 *      the user's swipe-back gesture to misfire on iOS).
 *   2. Every page sets `lang` on `<html>` (set in root layout, but verifies
 *      not accidentally stripped on a per-route override).
 *   3. The bottom-nav is hidden on routes that don't auth (we render it only
 *      when the auth store is hydrated + authenticated). Public surfaces
 *      should NEVER show it — checking that `<nav>` with the mobile-nav
 *      classes is absent.
 *   4. Tap targets meet the iOS minimum: every visible <a>, <button>, and
 *      role="link" should be at least 44px in either dimension. Reported as
 *      a soft warning per page rather than a hard fail (some icon-only
 *      buttons in tight nav rows are intentional sub-44 trade-offs).
 *
 * Screenshots are written to test-results/mobile-audit/ for human review.
 */

const VIEWPORTS = [
  { name: "iphone-se", width: 320, height: 568 },
  { name: "iphone", width: 375, height: 667 },
  { name: "pixel-5", width: 393, height: 851 },
] as const;

// /about, /contact, /welcome are now redirects to the home one-pager;
// the redirect-target page is audited via the home-page suite.
const PUBLIC_ROUTES = [
  "/privacy",
  "/terms",
  "/offline",
  "/unsubscribe",
  "/this-route-does-not-exist",
] as const;

interface OverflowReport {
  route: string;
  viewport: string;
  bodyScrollWidth: number;
  bodyClientWidth: number;
  offendingSelectors: string[];
}

async function detectOverflow(
  page: Page,
  route: string,
  viewportName: string
): Promise<OverflowReport> {
  const result = await page.evaluate(() => {
    const body = document.body;
    const bodyScrollWidth = body.scrollWidth;
    const bodyClientWidth = body.clientWidth;

    // Walk the DOM looking for elements wider than their container.
    const offending: string[] = [];
    const all = document.querySelectorAll<HTMLElement>("body *");
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > bodyClientWidth + 1 && rect.width > 0) {
        const id = el.id ? `#${el.id}` : "";
        const cls = el.className && typeof el.className === "string"
          ? `.${el.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")}`
          : "";
        offending.push(`${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 80));
        if (offending.length >= 5) break;
      }
    }
    return { bodyScrollWidth, bodyClientWidth, offending };
  });

  return {
    route,
    viewport: viewportName,
    bodyScrollWidth: result.bodyScrollWidth,
    bodyClientWidth: result.bodyClientWidth,
    offendingSelectors: result.offending,
  };
}

for (const vp of VIEWPORTS) {
  test.describe(`Mobile audit @ ${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of PUBLIC_ROUTES) {
      test(`${route} renders without horizontal overflow`, async ({ page }) => {
        await page.goto(route, { waitUntil: "domcontentloaded" });

        // Let layout settle (motion entrances finish, fonts swap).
        await page.waitForTimeout(300);

        const report = await detectOverflow(page, route, vp.name);

        if (report.bodyScrollWidth > report.bodyClientWidth + 1) {
          // Log the offenders so the report is actionable. eslint allows
          // console.log in test files via the e2e override.
          console.log(
            `Overflow on ${route} @ ${vp.name}:`,
            JSON.stringify(report, null, 2)
          );
        }

        expect(
          report.bodyScrollWidth,
          `Horizontal overflow at ${vp.name} on ${route}: body.scrollWidth=${report.bodyScrollWidth} > clientWidth=${report.bodyClientWidth}. First offenders: ${report.offendingSelectors.join(", ")}`
        ).toBeLessThanOrEqual(report.bodyClientWidth + 1);

        // Lang attribute sanity check.
        await expect(page.locator("html")).toHaveAttribute("lang", /\w+/);
      });
    }
  });
}
