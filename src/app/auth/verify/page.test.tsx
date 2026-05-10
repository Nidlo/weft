import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock Apollo's react bindings BEFORE importing the component so each test
// can drive useMutation behavior independently.
const verifyOtpMutationSpy =
  vi.fn<
    (args: { variables: { phone: string; code: string } }) => Promise<unknown>
  >();
const requestOtpMutationSpy =
  vi.fn<(args: { variables: { phone: string } }) => Promise<unknown>>();
let verifyLoading = false;

vi.mock("@apollo/client/react", () => ({
  useMutation: (doc: unknown) => {
    // Distinguish by the operation source string — VERIFY_OTP and REQUEST_OTP
    // are the only two mutations the verify page uses.
    const text =
      typeof doc === "object" && doc !== null && "loc" in doc
        ? String(
            (doc as { loc?: { source?: { body?: string } } }).loc?.source
              ?.body ?? ""
          )
        : "";
    if (text.includes("verifyOtp")) {
      return [verifyOtpMutationSpy, { loading: verifyLoading }];
    }
    return [requestOtpMutationSpy, { loading: false }];
  },
  useQuery: () => ({ data: undefined, loading: false }),
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

const setUserSpy = vi.fn<(...args: unknown[]) => void>();

vi.mock("@/lib/hooks/use-guest-guard", () => ({
  useGuestGuard: () => ({ isGuest: true, isLoading: false }),
}));

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: <T,>(selector: (s: { setUser: typeof setUserSpy }) => T) =>
    selector({ setUser: setUserSpy }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import VerifyOtpPage from "./page";

const PHONE = "+233557560032";

function typeCode(code: string): void {
  const inputs = screen.getAllByRole("textbox");
  for (let i = 0; i < code.length; i++) {
    fireEvent.change(inputs[i], { target: { value: code[i] } });
  }
}

beforeEach(() => {
  verifyOtpMutationSpy.mockReset();
  requestOtpMutationSpy.mockReset();
  routerPushSpy.mockReset();
  routerReplaceSpy.mockReset();
  setUserSpy.mockReset();
  verifyLoading = false;
  sessionStorage.setItem("nidlo:auth:pendingPhone", PHONE);
});

describe("VerifyOtpPage", () => {
  it("auto-submits when all 6 digits are typed", async () => {
    verifyOtpMutationSpy.mockResolvedValue({
      data: {
        verifyOtp: {
          token: "tok",
          isNew: true,
          user: {
            id: "u-1",
            firstName: null,
            lastName: null,
            fullName: null,
            phone: PHONE,
            email: null,
            avatarUrl: null,
            city: null,
            isDesigner: false,
            isOnboarded: false,
          },
        },
      },
    });

    render(<VerifyOtpPage />);
    typeCode("123456");

    await waitFor(() => {
      expect(verifyOtpMutationSpy).toHaveBeenCalledTimes(1);
    });
    expect(verifyOtpMutationSpy).toHaveBeenCalledWith({
      variables: { phone: PHONE, code: "123456" },
    });
  });

  it("routes a new user to /auth/role on success", async () => {
    verifyOtpMutationSpy.mockResolvedValue({
      data: {
        verifyOtp: {
          token: "tok",
          isNew: true,
          user: {
            id: "u-1",
            firstName: null,
            lastName: null,
            fullName: null,
            phone: PHONE,
            email: null,
            avatarUrl: null,
            city: null,
            isDesigner: false,
            isOnboarded: false,
          },
        },
      },
    });

    render(<VerifyOtpPage />);
    typeCode("654321");

    await waitFor(() => {
      expect(routerPushSpy).toHaveBeenCalledWith("/auth/role");
    });
    expect(setUserSpy).toHaveBeenCalledTimes(1);
  });

  it("routes an onboarded user to /dashboard on success", async () => {
    verifyOtpMutationSpy.mockResolvedValue({
      data: {
        verifyOtp: {
          token: "tok",
          isNew: false,
          user: {
            id: "u-2",
            firstName: "Kofi",
            lastName: "Mensah",
            fullName: "Kofi Mensah",
            phone: PHONE,
            email: null,
            avatarUrl: null,
            city: "Accra",
            isDesigner: false,
            isOnboarded: true,
          },
        },
      },
    });

    render(<VerifyOtpPage />);
    typeCode("111222");

    await waitFor(() => {
      expect(routerPushSpy).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("clears the digits and stays on the page after a wrong attempt, allowing a retry", async () => {
    // Bug B: a wrong attempt must NOT lock the user out of submitting again
    // — they should be able to enter the correct code without resending SMS.
    verifyOtpMutationSpy.mockRejectedValueOnce(
      new Error("Invalid code. 2 attempt(s) remaining.")
    );
    verifyOtpMutationSpy.mockResolvedValueOnce({
      data: {
        verifyOtp: {
          token: "tok",
          isNew: true,
          user: {
            id: "u-1",
            firstName: null,
            lastName: null,
            fullName: null,
            phone: PHONE,
            email: null,
            avatarUrl: null,
            city: null,
            isDesigner: false,
            isOnboarded: false,
          },
        },
      },
    });

    render(<VerifyOtpPage />);
    typeCode("000000");

    await waitFor(() => {
      expect(verifyOtpMutationSpy).toHaveBeenCalledTimes(1);
    });

    // After the rejection, inputs should be cleared and the page still mounted.
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    await waitFor(() => {
      expect(inputs.every((i) => i.value === "")).toBe(true);
    });
    expect(routerPushSpy).not.toHaveBeenCalled();

    // Second attempt with the correct code — must succeed.
    typeCode("123456");

    await waitFor(() => {
      expect(verifyOtpMutationSpy).toHaveBeenCalledTimes(2);
    });
    expect(verifyOtpMutationSpy).toHaveBeenLastCalledWith({
      variables: { phone: PHONE, code: "123456" },
    });
    await waitFor(() => {
      expect(routerPushSpy).toHaveBeenCalledWith("/auth/role");
    });
  });

  it("does not double-submit the same code (idempotency guard)", async () => {
    // Bug B variant: defensive guard against React render duplication / fast
    // paste collapsing into a duplicate auto-submit. The first call wins;
    // the second response would say "expired" (since the OTP key is
    // deleted on success) and the user would think the correct code
    // was rejected. The submitting ref prevents the second fire.
    const deferred: { resolve?: (v: unknown) => void } = {};
    verifyOtpMutationSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          deferred.resolve = resolve;
        })
    );

    render(<VerifyOtpPage />);
    typeCode("999999");
    // Simulate a second autosubmit attempt by re-typing the same code
    // before the first promise resolves. With the guard, only the first
    // call should reach Apollo.
    typeCode("999999");

    expect(verifyOtpMutationSpy).toHaveBeenCalledTimes(1);

    // Release the in-flight promise to clean up the test.
    deferred.resolve?.({
      data: {
        verifyOtp: {
          token: "tok",
          isNew: true,
          user: {
            id: "u-1",
            firstName: null,
            lastName: null,
            fullName: null,
            phone: PHONE,
            email: null,
            avatarUrl: null,
            city: null,
            isDesigner: false,
            isOnboarded: false,
          },
        },
      },
    });
    await waitFor(() => {
      expect(routerPushSpy).toHaveBeenCalled();
    });
  });
});
