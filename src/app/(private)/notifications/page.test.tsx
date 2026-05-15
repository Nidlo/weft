import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useQuerySpy = vi.fn();
const usePushPermissionSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => useQuerySpy(...args),
  useMutation: () => [vi.fn(), { loading: false }],
}));

vi.mock("@/lib/hooks/use-push-notifications", () => ({
  usePushPermission: () => usePushPermissionSpy(),
}));

vi.mock("@/lib/stores/notifications", () => ({
  useNotificationsStore: <T,>(
    selector: (s: { setUnreadCount: () => void; resetUnread: () => void }) => T
  ) => selector({ setUnreadCount: vi.fn(), resetUnread: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import NotificationsPage from "./page";

const USER = { id: "u-1", isOnboarded: true };

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useQuerySpy.mockReset();
  usePushPermissionSpy.mockReset();
  usePushPermissionSpy.mockReturnValue({
    shouldPromptUi: false,
    requestPermission: vi.fn(),
  });
});

describe("NotificationsPage", () => {
  it("renders the loading skeleton until the auth guard resolves", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    useQuerySpy.mockReturnValue({
      data: undefined,
      loading: true,
      fetchMore: vi.fn(),
    });
    const { container } = render(<NotificationsPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial header + settings link when there are no notifications", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useQuerySpy.mockReturnValue({
      data: {
        myNotifications: {
          data: [],
          paginatorInfo: { hasMorePages: false },
        },
      },
      loading: false,
      fetchMore: vi.fn(),
    });
    render(<NotificationsPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /notifications/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^inbox$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /notification preferences/i })
    ).toBeInTheDocument();
  });

  it("shows the empty state with display headline + supporting copy", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useQuerySpy.mockReturnValue({
      data: {
        myNotifications: {
          data: [],
          paginatorInfo: { hasMorePages: false },
        },
      },
      loading: false,
      fetchMore: vi.fn(),
    });
    render(<NotificationsPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /no notifications yet/i })
    ).toBeInTheDocument();
  });

  it("renders the push permission prompt when shouldPromptUi is true", () => {
    usePushPermissionSpy.mockReturnValue({
      shouldPromptUi: true,
      requestPermission: vi.fn(),
    });
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useQuerySpy.mockReturnValue({
      data: {
        myNotifications: {
          data: [],
          paginatorInfo: { hasMorePages: false },
        },
      },
      loading: false,
      fetchMore: vi.fn(),
    });
    render(<NotificationsPage />);
    expect(screen.getByText(/enable push notifications/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^enable$/i })
    ).toBeInTheDocument();
  });

  it("renders notification rows + unread badge when notifications exist", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useQuerySpy.mockReturnValue({
      data: {
        myNotifications: {
          data: [
            {
              id: "n-1",
              title: "Order confirmed",
              body: "Your kaba is being cut.",
              typeIcon: "package",
              actionUrl: "/orders/1",
              readAt: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: "n-2",
              title: "Payment received",
              body: "GHS 500 received.",
              typeIcon: "credit-card",
              actionUrl: "/orders/2",
              readAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ],
          paginatorInfo: { hasMorePages: false },
        },
      },
      loading: false,
      fetchMore: vi.fn(),
    });
    render(<NotificationsPage />);
    expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/payment received/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark all read/i })
    ).toBeInTheDocument();
  });
});
