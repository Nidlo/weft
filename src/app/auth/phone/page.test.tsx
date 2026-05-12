import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const requestOtpSpy = vi.fn<(args: unknown) => Promise<unknown>>();
const socialLoginSpy = vi.fn<(args: unknown) => Promise<unknown>>();

vi.mock("@apollo/client/react", () => ({
  useMutation: (doc: unknown) => {
    const text =
      typeof doc === "object" && doc !== null && "loc" in doc
        ? String(
            (doc as { loc?: { source?: { body?: string } } }).loc?.source
              ?.body ?? ""
          )
        : "";
    if (text.includes("requestOtp")) {
      return [requestOtpSpy, { loading: false }];
    }
    return [socialLoginSpy, { loading: false }];
  },
  useQuery: () => ({
    data: {
      countries: [
        {
          id: "gh",
          name: "Ghana",
          iso2: "GH",
          phoneCode: "233",
          emoji: null,
          currency: "GHS",
          currencySymbol: null,
          isActive: true,
          phoneDigits: 10,
          phoneStartsWithZero: true,
          phonePlaceholder: "024 123 4567",
        },
      ],
    },
    loading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/lib/hooks/use-guest-guard", () => ({
  useGuestGuard: () => ({ isGuest: true, isLoading: false }),
}));

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: <T,>(selector: (s: { setUser: () => void }) => T) =>
    selector({ setUser: vi.fn() }),
}));

vi.mock("./google-sign-in-button", () => ({
  GoogleSignInButton: () => <button type="button">Continue with Google</button>,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import PhoneAuthPage from "./page";

beforeEach(() => {
  requestOtpSpy.mockReset();
  socialLoginSpy.mockReset();
});

describe("PhoneAuthPage", () => {
  it("renders the phone input and the editorial heading", () => {
    render(<PhoneAuthPage />);
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it("disables submit until a valid Ghana number is entered", () => {
    render(<PhoneAuthPage />);
    const input = screen.getByLabelText(/phone number/i);
    const submit = screen.getByRole("button", {
      name: /send verification code/i,
    });
    expect(submit).toBeDisabled();
    fireEvent.change(input, { target: { value: "0241234567" } });
    expect(submit).not.toBeDisabled();
  });

  it("hides Google + Apple sign-in while SOCIAL_LOGIN_ENABLED is off", () => {
    // The auth/phone page module-local flag `SOCIAL_LOGIN_ENABLED` is
    // currently `false` because the social backends are being unblocked.
    // When the flag flips back to `true`, this test will fail and should
    // be replaced with the original
    // "offers a Continue with Apple option alongside Google" assertion.
    render(<PhoneAuthPage />);
    expect(
      screen.queryByRole("button", { name: /continue with apple/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /continue with google/i })
    ).not.toBeInTheDocument();
  });
});
