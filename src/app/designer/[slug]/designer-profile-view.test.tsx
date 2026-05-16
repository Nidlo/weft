import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const trackViewSpy = vi.fn<() => Promise<unknown>>();

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [trackViewSpy, { loading: false }],
  useQuery: () => ({ data: undefined, loading: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/designer/test-slug",
}));

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: <T,>(
    selector: (s: {
      isAuthenticated: boolean;
      user: null;
      _hasHydrated: boolean;
      isLoading: boolean;
    }) => T
  ) =>
    selector({
      isAuthenticated: false,
      user: null,
      _hasHydrated: true,
      isLoading: false,
    }),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={src} alt={alt} />;
  },
}));

vi.mock("@/components/reviews/reviews-section", () => ({
  ReviewsSection: () => <div data-testid="reviews-section" />,
}));

vi.mock("@/components/shared/share-buttons", () => ({
  ShareButtons: () => <div data-testid="share-buttons" />,
}));

import { DesignerProfileView } from "./designer-profile-view";
import type { GqlUserWithProfile } from "@/types/graphql";

const DESIGNER: GqlUserWithProfile = {
  id: "u-1",
  firstName: "Adwoa",
  lastName: "Mensah",
  fullName: "Adwoa Mensah",
  avatarUrl: null,
  city: "Accra",
  countryCode: "GH",
  isVerified: true,
  isDesigner: true,
  isOnboarded: true,
  designerProfile: {
    id: "d-1",
    displayName: "Adwoa Studio",
    slug: "adwoa-studio",
    bio: "Bespoke fashion for the modern Ghanaian.",
    specializations: ["kaba-and-slit", "wedding-gown"],
    pricingMin: 50000,
    pricingMax: 200000,
    portfolioImages: [
      {
        url: "https://example.com/a.jpg",
        thumbnail_url: "https://example.com/a-thumb.jpg",
        caption: "Royal blue Kaba",
      },
    ],
    equipment: [],
    ratingAvg: 4.9,
    totalReviews: 32,
    ordersCompleted: 48,
    onTimeRate: 95,
    responseTimeAvg: 120,
    isAcceptingOrders: true,
    profileCompleteness: 90,
  },
} as unknown as GqlUserWithProfile;

beforeEach(() => {
  trackViewSpy.mockReset();
  trackViewSpy.mockResolvedValue({});
});

describe("DesignerProfileView", () => {
  it("renders the editorial hero with name + city + verified badge", () => {
    render(<DesignerProfileView designer={DESIGNER} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /adwoa studio/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Accra")).toBeInTheDocument();
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it("renders the bio, specializations, and pricing sections", () => {
    render(<DesignerProfileView designer={DESIGNER} />);
    expect(screen.getByText(/bespoke fashion/i)).toBeInTheDocument();
    expect(screen.getByText(/kaba and slit/i)).toBeInTheDocument();
    expect(screen.getByText(/wedding gown/i)).toBeInTheDocument();
    // Pricing renders short-form via formatPesewasShort (e.g. GH₵500)
    expect(screen.getByText(/GH/)).toBeInTheDocument();
  });

  it("fires the trackView mutation once on mount", async () => {
    render(<DesignerProfileView designer={DESIGNER} />);
    expect(trackViewSpy).toHaveBeenCalledTimes(1);
    expect(trackViewSpy).toHaveBeenCalledWith({
      variables: { slug: "adwoa-studio" },
    });
  });

  it("disables the request-quote button when the designer is not accepting orders", () => {
    const offline: GqlUserWithProfile = {
      ...DESIGNER,
      designerProfile: {
        ...DESIGNER.designerProfile!,
        isAcceptingOrders: false,
      },
    };
    render(<DesignerProfileView designer={offline} />);
    const cta = screen.getByRole("button", {
      name: /not accepting orders/i,
    });
    expect(cta).toBeDisabled();
  });

  it("renders the studio section when the designer opted workshop public", () => {
    const withStudio: GqlUserWithProfile = {
      ...DESIGNER,
      designerProfile: {
        ...DESIGNER.designerProfile!,
        workshopName: "Adwoa Atelier",
        workshopAddress: "12 Oxford St, Osu, Accra",
      },
    } as unknown as GqlUserWithProfile;
    render(<DesignerProfileView designer={withStudio} />);
    expect(screen.getByText(/where they work/i)).toBeInTheDocument();
    expect(screen.getByText("Adwoa Atelier")).toBeInTheDocument();
    expect(screen.getByText("12 Oxford St, Osu, Accra")).toBeInTheDocument();
  });

  it("omits the studio section entirely when workshop fields are scrubbed", () => {
    // Backend nulls workshop_* for non-owners when it's private (default).
    render(<DesignerProfileView designer={DESIGNER} />);
    expect(screen.queryByText(/where they work/i)).not.toBeInTheDocument();
  });

  it("hides the Track record section when stats visibility is off", () => {
    const noStats: GqlUserWithProfile = {
      ...DESIGNER,
      designerProfile: {
        ...DESIGNER.designerProfile!,
        publicVisibility: {
          bio: true,
          pricing: true,
          portfolio: true,
          experience: true,
          stats: false,
          city: true,
          workshop: false,
        },
      },
    } as unknown as GqlUserWithProfile;
    render(<DesignerProfileView designer={noStats} />);
    expect(screen.queryByText(/track record/i)).not.toBeInTheDocument();
  });

  it("shows the Track record section by default (no visibility map)", () => {
    render(<DesignerProfileView designer={DESIGNER} />);
    expect(screen.getByText(/track record/i)).toBeInTheDocument();
  });
});
