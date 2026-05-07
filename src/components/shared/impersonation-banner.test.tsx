import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { ImpersonationBanner } from "./impersonation-banner";
import { useAuthStore } from "@/lib/stores/auth";

const baseUser = {
  id: "u1",
  firstName: "Yaa",
  lastName: "Mensah",
  fullName: "Yaa Mensah",
  phone: "+233244555111",
  email: "yaa@example.com",
  avatarUrl: null,
  city: "Accra",
  isDesigner: false,
  isOnboarded: true,
};

describe("ImpersonationBanner", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: true,
    });
  });

  it("renders nothing when the session is not an impersonation", () => {
    useAuthStore.setState({
      user: { ...baseUser, isImpersonated: false },
      isAuthenticated: true,
    });

    const { container } = render(<ImpersonationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the banner with the impersonator email when isImpersonated is true", () => {
    useAuthStore.setState({
      user: {
        ...baseUser,
        isImpersonated: true,
        impersonatorEmail: "snad@nidlo.test",
      },
      isAuthenticated: true,
    });

    render(<ImpersonationBanner />);
    expect(screen.getByTestId("impersonation-banner")).toBeInTheDocument();
    expect(screen.getByText(/Acting as Yaa Mensah/)).toBeInTheDocument();
    expect(screen.getByText(/snad@nidlo.test/)).toBeInTheDocument();
  });

  it("links the Stop button to the backend impersonate-stop endpoint", () => {
    useAuthStore.setState({
      user: {
        ...baseUser,
        isImpersonated: true,
        impersonatorEmail: "snad@nidlo.test",
      },
      isAuthenticated: true,
    });

    render(<ImpersonationBanner />);
    const link = screen.getByRole("link", { name: /Stop impersonating/i });
    // NEXT_PUBLIC_API_URL in vitest defaults to undefined; the component
    // gracefully degrades to a relative URL ending in /admin/impersonate-stop.
    expect(link.getAttribute("href")).toMatch(/\/admin\/impersonate-stop$/);
  });

  it("falls back to a generic message when impersonatorEmail is null", () => {
    useAuthStore.setState({
      user: {
        ...baseUser,
        isImpersonated: true,
        impersonatorEmail: null,
      },
      isAuthenticated: true,
    });

    render(<ImpersonationBanner />);
    expect(
      screen.getByText(/Return to your admin session\.$/),
    ).toBeInTheDocument();
  });

  it("renders nothing when there is no user at all (logged out)", () => {
    const { container } = render(<ImpersonationBanner />);
    expect(container.firstChild).toBeNull();
  });
});
