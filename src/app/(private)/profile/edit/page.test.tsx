import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useQuerySpy = vi.fn();
const updateMyInfoSpy = vi.fn().mockResolvedValue({ data: {} });
const updateProfileSpy = vi
  .fn()
  .mockResolvedValue({ data: { updateProfile: { id: "p-1", slug: "kojo" } } });
const updateAvatarSpy = vi.fn().mockResolvedValue({ data: {} });

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-autosave", () => ({
  useAutosave: () => ({ restored: null, clear: vi.fn() }),
}));

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: (selector: (s: { setUser: (u: unknown) => void }) => unknown) =>
    selector({ setUser: vi.fn() }),
}));

vi.mock("@/lib/hooks/use-specializations", () => ({
  useSpecializations: () => ({
    specializations: [
      { id: "s-1", name: "Kaba & Slit", slug: "kaba-and-slit" },
      { id: "s-2", name: "Wedding Dress", slug: "wedding-dress" },
    ],
    loading: false,
  }),
}));

vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => useQuerySpy(...args),
  useMutation: (doc: unknown) => {
    // The page mounts three mutations. Discriminate by the parsed
    // gql definition name so each one returns its dedicated spy and
    // the test can assert on them independently.
    const def = (
      doc as {
        definitions?: Array<{ name?: { value?: string } }>;
      }
    )?.definitions?.[0];
    const name = def?.name?.value;
    if (name === "UpdateAvatar") {
      return [updateAvatarSpy, { loading: false }];
    }
    if (name === "UpdateProfile") {
      return [updateProfileSpy, { loading: false }];
    }
    return [updateMyInfoSpy, { loading: false }];
  },
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

// LocationPicker hits Google Maps in real life. Stub it with a minimal
// shell exposing a "pin this address" button so we can simulate a fresh
// pick without booting maps in jsdom.
vi.mock("@/components/shared/location-picker", () => ({
  LocationPicker: ({
    label,
    value,
    onChange,
  }: {
    label?: string;
    value?: {
      lat: number;
      lng: number;
      formattedAddress: string;
    } | null;
    onChange: (loc: {
      lat: number;
      lng: number;
      formattedAddress: string;
      city: string | null;
      region: string | null;
      country: string | null;
      countryCode: string | null;
      postalCode: string | null;
      addressLine: string | null;
    }) => void;
  }) => (
    <div
      data-testid={`location-picker-${(label ?? "").toLowerCase().replace(/[^a-z]+/g, "-")}`}
    >
      <span>{label}</span>
      <output>{value?.formattedAddress ?? ""}</output>
      <button
        type="button"
        onClick={() =>
          onChange({
            lat: 5.61,
            lng: -0.185,
            formattedAddress: "12 Independence Ave, Accra",
            city: "Accra",
            region: "Greater Accra",
            country: "Ghana",
            countryCode: "GH",
            postalCode: null,
            addressLine: "12 Independence Ave",
          })
        }
      >
        {`pin-${label}`}
      </button>
    </div>
  ),
}));

const CLIENT_USER = {
  id: "u-1",
  firstName: "Adwoa",
  lastName: "Mensah",
  otherNames: null,
  email: null,
  city: "Accra",
  avatarUrl: null,
  isDesigner: false,
  isOnboarded: true,
  designerProfile: null,
};

const DESIGNER_USER = {
  ...CLIENT_USER,
  id: "u-2",
  isDesigner: true,
  designerProfile: { slug: "kojo" },
};

const DESIGNER_QUERY_DATA = {
  designer: {
    designerProfile: {
      id: "p-1",
      displayName: "Kojo Atelier",
      slug: "kojo",
      bio: "Tailoring since 2018.",
      specializations: ["kaba-and-slit"],
      pricingMin: 10000,
      pricingMax: 50000,
      portfolioImages: [],
      isAcceptingOrders: true,
      workshopName: null,
      workshopAddress: null,
      workshopLat: null,
      workshopLng: null,
      profileCompleteness: 60,
      ordersCompleted: 0,
    },
  },
};

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useQuerySpy.mockReset();
  updateMyInfoSpy.mockClear();
  updateProfileSpy.mockClear();
  updateAvatarSpy.mockClear();
  useQuerySpy.mockReturnValue({ data: DESIGNER_QUERY_DATA, loading: false });
});

import ProfileEditPage from "./page";

describe("ProfileEditPage", () => {
  it("hides the Studio location section for non-designer users", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<ProfileEditPage />);
    expect(
      screen.queryByRole("heading", { name: /studio location/i })
    ).not.toBeInTheDocument();
    // Designer profile section is also hidden for clients.
    expect(
      screen.queryByRole("heading", { name: /designer profile/i })
    ).not.toBeInTheDocument();
  });

  it("shows three independent Save bars for designers (personal, designer, studio)", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);

    // Each Save button keeps a stable aria-label regardless of dirty state,
    // so the three are queryable + assertable as disabled out of the gate.
    const personalBtn = screen.getByRole("button", {
      name: /save personal info/i,
    });
    const designerBtn = screen.getByRole("button", {
      name: /save designer profile/i,
    });
    const studioBtn = screen.getByRole("button", {
      name: /save studio location/i,
    });
    expect(personalBtn).toBeDisabled();
    expect(designerBtn).toBeDisabled();
    expect(studioBtn).toBeDisabled();
  });

  it("clients only see the personal-info Save bar", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<ProfileEditPage />);
    expect(
      screen.getByRole("button", { name: /save personal info/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save designer profile/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save studio location/i })
    ).not.toBeInTheDocument();
  });

  it("saving the studio location only sends workshop fields to updateProfile (no profile fields touched)", async () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /pin-studio address/i })
      );
    });

    const studioBtn = screen.getByRole("button", {
      name: /save studio location/i,
    });
    expect(studioBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(studioBtn);
    });

    expect(updateProfileSpy).toHaveBeenCalledTimes(1);
    const variables = updateProfileSpy.mock.calls[0][0]?.variables?.input;
    expect(variables).toMatchObject({
      workshopAddress: "12 Independence Ave, Accra",
      workshopLat: 5.61,
      workshopLng: -0.185,
    });
    // Crucially the shop-profile fields must NOT be in the payload - the
    // user only edited the studio, so we must not blindly resubmit (and
    // potentially overwrite with stale form state) the bio / pricing /
    // specializations.
    expect(variables).not.toHaveProperty("bio");
    expect(variables).not.toHaveProperty("specializations");
    expect(variables).not.toHaveProperty("pricingMin");
    expect(variables).not.toHaveProperty("isAcceptingOrders");
    // And updateMyInfo (personal info) must not have fired at all.
    expect(updateMyInfoSpy).not.toHaveBeenCalled();
  });

  it("saving the designer profile only sends shop fields, never workshop fields", async () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);

    // Edit the bio to dirty the designer-profile section.
    const bio = screen.getByLabelText(/^bio$/i);
    await act(async () => {
      fireEvent.change(bio, { target: { value: "Updated bio copy." } });
    });

    const designerBtn = screen.getByRole("button", {
      name: /save designer profile/i,
    });
    expect(designerBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(designerBtn);
    });

    expect(updateProfileSpy).toHaveBeenCalledTimes(1);
    const variables = updateProfileSpy.mock.calls[0][0]?.variables?.input;
    expect(variables).toMatchObject({ bio: "Updated bio copy." });
    expect(variables).not.toHaveProperty("workshopName");
    expect(variables).not.toHaveProperty("workshopAddress");
    expect(variables).not.toHaveProperty("workshopLat");
    expect(updateMyInfoSpy).not.toHaveBeenCalled();
  });

  it("saving personal info calls updateMyInfo, never updateProfile", async () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "Akua" } });
    });

    const personalBtn = screen.getByRole("button", {
      name: /save personal info/i,
    });
    expect(personalBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(personalBtn);
    });

    expect(updateMyInfoSpy).toHaveBeenCalledTimes(1);
    expect(updateMyInfoSpy.mock.calls[0][0]?.variables?.input).toMatchObject({
      firstName: "Akua",
    });
    expect(updateProfileSpy).not.toHaveBeenCalled();
  });

  it("renders auto-save guidance under the Portfolio header", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);
    expect(screen.getByText(/each photo saves on upload/i)).toBeInTheDocument();
  });

  it("renders 'saves automatically' affordance under the avatar", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);
    expect(
      screen.getByText(/tap photo to change · saves automatically/i)
    ).toBeInTheDocument();
  });

  it("marks first name + last name with the required-field asterisk", () => {
    useAuthGuardSpy.mockReturnValue({ user: CLIENT_USER, isReady: true });
    render(<ProfileEditPage />);
    const firstName = screen.getByLabelText(/first name/i);
    const lastName = screen.getByLabelText(/last name/i);
    expect(firstName).toBeRequired();
    expect(lastName).toBeRequired();
  });
});
