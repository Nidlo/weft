import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { CookieConsentBanner } from "./cookie-consent-banner";
import {
  CONSENT_VERSION,
  __resetConsentCacheForTests,
} from "@/lib/consent/use-consent";

const STORAGE_KEY = "nidlo:consent:v1";

beforeEach(() => {
  window.localStorage.clear();
  __resetConsentCacheForTests();
});

describe("<CookieConsentBanner />", () => {
  it("renders for users who haven't decided yet", () => {
    render(<CookieConsentBanner />);
    expect(screen.getByTestId("cookie-consent-banner")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-consent-accept")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-consent-decline")).toBeInTheDocument();
  });

  it("stays hidden once a decision is already recorded in localStorage", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-05-15T12:00:00.000Z",
        version: CONSENT_VERSION,
      })
    );

    render(<CookieConsentBanner />);
    expect(
      screen.queryByTestId("cookie-consent-banner")
    ).not.toBeInTheDocument();
  });

  it("clicking Accept stores analytics=true and removes the banner", () => {
    render(<CookieConsentBanner />);

    act(() => {
      fireEvent.click(screen.getByTestId("cookie-consent-accept"));
    });

    expect(
      screen.queryByTestId("cookie-consent-banner")
    ).not.toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.analytics).toBe(true);
    expect(saved.version).toBe(CONSENT_VERSION);
  });

  it("clicking Decline stores analytics=false and removes the banner", () => {
    render(<CookieConsentBanner />);

    act(() => {
      fireEvent.click(screen.getByTestId("cookie-consent-decline"));
    });

    expect(
      screen.queryByTestId("cookie-consent-banner")
    ).not.toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.analytics).toBe(false);
  });

  it("ESC dismisses the banner for this session WITHOUT recording consent (privacy-safe default)", () => {
    render(<CookieConsentBanner />);
    expect(screen.getByTestId("cookie-consent-banner")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(
      screen.queryByTestId("cookie-consent-banner")
    ).not.toBeInTheDocument();
    // Crucially, no storage was written — user is still "undecided".
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("links the user to the public cookie policy", () => {
    render(<CookieConsentBanner />);
    const link = screen.getByRole("link", { name: /cookie policy/i });
    expect(link).toHaveAttribute("href", "/cookies");
  });
});
