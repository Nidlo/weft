import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
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
      firstName: "Kwame",
      lastName: "Mensah",
      fullName: "Kwame Mensah",
      phone: "+233201234567",
      email: null,
      avatarUrl: null,
      city: "Accra",
      isDesigner: false,
      isOnboarded: true,
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("should clear user on logout", () => {
    useAuthStore.getState().setUser({
      id: "1",
      firstName: "Test",
      lastName: "Designer",
      fullName: "Test Designer",
      phone: "+233201234567",
      email: null,
      avatarUrl: null,
      city: null,
      isDesigner: true,
      isOnboarded: false,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});
