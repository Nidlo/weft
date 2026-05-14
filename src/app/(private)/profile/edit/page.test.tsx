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
  });

  it("shows the Studio location section + studio-name input for designers", () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);
    expect(
      screen.getByRole("heading", { name: /studio location/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/studio name/i)).toBeInTheDocument();
    expect(
      screen.getByTestId("location-picker-studio-address")
    ).toBeInTheDocument();
  });

  it("dirty-state enables Save when the studio address pin moves, and updateProfile is called with workshop coordinates", async () => {
    useAuthGuardSpy.mockReturnValue({ user: DESIGNER_USER, isReady: true });
    render(<ProfileEditPage />);

    const saveBtn = screen.getByRole("button", {
      name: /all saved|save changes/i,
    });
    expect(saveBtn).toBeDisabled();

    // Pick a studio location via the stub.
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /pin-studio address/i })
      );
    });

    // Save should now be enabled.
    const dirtyBtn = screen.getByRole("button", { name: /save changes/i });
    expect(dirtyBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(dirtyBtn);
    });

    expect(updateProfileSpy).toHaveBeenCalledTimes(1);
    const variables = updateProfileSpy.mock.calls[0][0]?.variables?.input;
    expect(variables).toMatchObject({
      workshopAddress: "12 Independence Ave, Accra",
      workshopLat: 5.61,
      workshopLng: -0.185,
    });
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
});
