import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const becomeDesignerSpy = vi.fn<() => Promise<unknown>>();

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [becomeDesignerSpy, { loading: false }],
}));

const routerPushSpy = vi.fn<(href: string) => void>();
const routerReplaceSpy = vi.fn<(href: string) => void>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPushSpy,
    replace: routerReplaceSpy,
    back: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: () => ({ isReady: true, user: null, isAuthenticated: true }),
}));

const setUserSpy = vi.fn<(...args: unknown[]) => void>();

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: <T,>(
    selector: (s: {
      user: { id: string } | null;
      setUser: typeof setUserSpy;
    }) => T
  ) =>
    selector({
      user: { id: "u-1" },
      setUser: setUserSpy,
    }),
}));

const { toastSuccess, toastInfo, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn<(msg: string) => void>(),
  toastInfo: vi.fn<(msg: string) => void>(),
  toastError: vi.fn<(msg: string) => void>(),
}));

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, info: toastInfo, error: toastError },
}));

import RoleSelectionPage from "./page";

beforeEach(() => {
  becomeDesignerSpy.mockReset();
  routerPushSpy.mockReset();
  routerReplaceSpy.mockReset();
  setUserSpy.mockReset();
  toastSuccess.mockReset();
  toastInfo.mockReset();
  toastError.mockReset();
});

describe("RoleSelectionPage", () => {
  it("renders all three role options with their titles", () => {
    render(<RoleSelectionPage />);
    expect(
      screen.getByRole("button", { name: /I want clothes made/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /I'm a designer/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /I run a workshop/i })
    ).toBeInTheDocument();
  });

  it("routes a client straight to /onboarding/client without firing the designer mutation", async () => {
    render(<RoleSelectionPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /I want clothes made/i })
    );

    await waitFor(() => {
      expect(routerPushSpy).toHaveBeenCalledWith("/onboarding/client");
    });
    expect(becomeDesignerSpy).not.toHaveBeenCalled();
  });

  it("calls becomeDesigner and routes to /onboarding when designer is picked", async () => {
    becomeDesignerSpy.mockResolvedValue({
      data: { becomeDesigner: { id: "d-1" } },
    });

    render(<RoleSelectionPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /I'm a designer/i })
    );

    await waitFor(() => {
      expect(becomeDesignerSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(routerPushSpy).toHaveBeenCalledWith("/onboarding");
    });
    expect(setUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({ isDesigner: true })
    );
  });

  it("shows the coming-soon toast and does NOT navigate when the disabled organization option is clicked", () => {
    render(<RoleSelectionPage />);

    const orgBtn = screen.getByRole("button", {
      name: /I run a workshop/i,
    });
    expect(orgBtn).toBeDisabled();
  });
});
