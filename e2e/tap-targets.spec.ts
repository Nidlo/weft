import { test, expect, type Page } from "@playwright/test";

/**
 * Tap-target audit. iOS Human Interface Guidelines + Material Design both
 * recommend ≥ 44x44pt as the minimum hit area for any tappable element.
 * This spec walks every visible <a>, <button>, [role=button], and
 * [role=link] on each public route at the smallest realistic mobile
 * viewport (iPhone SE, 320px) and FAILS if any violate the rule.
 *
 * Exclusions:
 *   - Elements inside a `data-tap-target-skip` ancestor (decorative chips
 *     in scrollers where the parent rail acts as the gesture target)
 *   - Elements with `aria-hidden="true"` (decorative)
 *   - Elements outside the viewport (off-screen)
 *   - Sub-elements of an interactive ancestor (the parent provides the
 *     hit area; counting the inner <span> double-counts and produces
 *     false positives)
 */

// /about, /contact, /welcome are now redirect-only (folded into the home
// one-pager). Their tap targets live on the home page and are exercised
// by a dedicated home-page audit; here we keep the dedicated static
// surfaces.
const PUBLIC_ROUTES = [
  "/privacy",
  "/terms",
  "/offline",
  "/unsubscribe",
] as const;

const MIN = 44;

interface Violation {
  selector: string;
  width: number;
  height: number;
  text: string;
}

async function auditTapTargets(page: Page): Promise<Violation[]> {
  return await page.evaluate((MIN) => {
    const selectors = [
      "a[href]",
      "button:not([disabled])",
      '[role="button"]',
      '[role="link"]',
      "input[type=button]",
      "input[type=submit]",
    ];
    const all = document.querySelectorAll<HTMLElement>(selectors.join(","));
    const violations: Array<{
      selector: string;
      width: number;
      height: number;
      text: string;
    }> = [];

    for (const el of all) {
      // Skip if any ancestor opted out.
      if (el.closest("[data-tap-target-skip]")) continue;
      // Skip explicitly aria-hidden.
      if (el.getAttribute("aria-hidden") === "true") continue;
      // Skip if any interactive ancestor exists — the parent provides
      // the hit area and we don't want to double-count nested spans.
      let parent = el.parentElement;
      let nestedInsideInteractive = false;
      while (parent) {
        if (
          parent.matches(
            'a[href], button, [role="button"], [role="link"]'
          )
        ) {
          nestedInsideInteractive = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (nestedInsideInteractive) continue;

      const rect = el.getBoundingClientRect();
      // Skip off-screen / not-rendered.
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

      if (rect.width < MIN || rect.height < MIN) {
        const id = el.id ? `#${el.id}` : "";
        const cls =
          typeof el.className === "string" && el.className
            ? `.${el.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")}`
            : "";
        violations.push({
          selector: `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          text: (el.textContent ?? "").trim().slice(0, 40),
        });
      }
    }
    return violations;
  }, MIN);
}

test.describe("Tap-target audit @ iPhone SE (320px)", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no tap targets under ${MIN}x${MIN}px`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      // Let layout settle (font swap, motion entrances).
      await page.waitForTimeout(400);

      const violations = await auditTapTargets(page);

      if (violations.length > 0) {
        const lines = violations
          .map(
            (v) =>
              `  ${v.selector} — ${v.width}x${v.height}px — "${v.text}"`
          )
          .join("\n");
        // Surface a readable diff in the test output.
        console.log(`Tap-target violations on ${route}:\n${lines}`);
      }

      expect(
        violations,
        `${violations.length} tap target(s) under ${MIN}x${MIN}px on ${route}`
      ).toHaveLength(0);
    });
  }
});
