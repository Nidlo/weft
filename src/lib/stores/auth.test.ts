import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it("should start with no authenticated user", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set user and mark as authenticated", () => {
    const mockUser = {
      id: "1",
      name: "Kwame Mensah",
      phone: "+233201234567",
      email: null,
      role: "client" as const,
      avatarUrl: null,
      city: "Accra",
      isOnboarded: true,
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("should store token", () => {
    useAuthStore.getState().setToken("test-token-123");
    expect(useAuthStore.getState().token).toBe("test-token-123");
  });

  it("should clear user and token on logout", () => {
    useAuthStore.getState().setUser({
      id: "1",
      name: "Test",
      phone: "+233201234567",
      email: null,
      role: "designer",
      avatarUrl: null,
      city: null,
      isOnboarded: false,
    });
    useAuthStore.getState().setToken("some-token");

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});
