"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useAutosave } from "@/lib/hooks/use-autosave";
import { useAuthStore } from "@/lib/stores/auth";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { LocationPicker } from "@/components/shared/location-picker";
import {
  UPDATE_MY_INFO,
  UPDATE_AVATAR,
  UPDATE_PROFILE,
  ADD_PORTFOLIO_IMAGE,
  REMOVE_PORTFOLIO_IMAGE,
} from "@/lib/graphql/mutations/profile";
import { GET_DESIGNER } from "@/lib/graphql/queries/designer";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type {
  AddPortfolioImageData,
  DesignerData,
  PortfolioImage,
  RemovePortfolioImageData,
} from "@/types/graphql";
import type { LocationData } from "@/types/location";
import { cn } from "@/lib/utils";

interface DesignerFormState {
  displayName: string;
  bio: string;
  specializations: string[];
  pricingMin: string;
  pricingMax: string;
  isAcceptingOrders: boolean;
}

const emptyDesigner: DesignerFormState = {
  displayName: "",
  bio: "",
  specializations: [],
  pricingMin: "",
  pricingMax: "",
  isAcceptingOrders: true,
};

export default function ProfileEditPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  // Account basics
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);

  // Designer-only fields
  const [designer, setDesigner] = useState<DesignerFormState>(emptyDesigner);
  // Snapshot of the designer state at hydration — used for dirty-detection.
  const [designerSnapshot, setDesignerSnapshot] =
    useState<DesignerFormState>(emptyDesigner);

  // Track which user.id we've already seeded the form from (React 19 idiom:
  // derive state from props by setting state during render when the source
  // changes).
  const [seededFromUserId, setSeededFromUserId] = useState<
    string | undefined
  >();
  const [designerHydrated, setDesignerHydrated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const designerSlug = user?.designerProfile?.slug ?? null;
  const { data: designerData, loading: designerLoading } =
    useQuery<DesignerData>(GET_DESIGNER, {
      variables: { slug: designerSlug ?? "" },
      skip: !user?.isDesigner || !designerSlug,
      fetchPolicy: "cache-and-network",
    });
  const { specializations: allSpecs, loading: specsLoading } =
    useSpecializations();

  const [updateMyInfo, { loading: savingInfo }] = useMutation(UPDATE_MY_INFO, {
    refetchQueries: [{ query: ME_QUERY }],
  });
  const [updateProfile, { loading: savingProfile }] = useMutation(
    UPDATE_PROFILE,
    {
      refetchQueries: [{ query: ME_QUERY }],
    }
  );
  const [updateAvatar, { loading: uploadingAvatar }] = useMutation<{
    updateAvatar: { id: string; avatarUrl: string | null };
  }>(UPDATE_AVATAR, {
    refetchQueries: [{ query: ME_QUERY }],
  });

  const [addPortfolioImage] = useMutation<AddPortfolioImageData>(
    ADD_PORTFOLIO_IMAGE,
    {
      refetchQueries: () => [
        { query: GET_DESIGNER, variables: { slug: designerSlug ?? "" } },
      ],
    }
  );
  const [removePortfolioImage, { loading: removingImage }] =
    useMutation<RemovePortfolioImageData>(REMOVE_PORTFOLIO_IMAGE, {
      refetchQueries: () => [
        { query: GET_DESIGNER, variables: { slug: designerSlug ?? "" } },
      ],
    });

  // Portfolio upload state — mirrors StepPortfolio pattern
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioDragOver, setPortfolioDragOver] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  interface FailedUpload {
    id: string;
    file: File;
    reason: string;
  }
  const [portfolioFailed, setPortfolioFailed] = useState<FailedUpload[]>([]);

  if (user && user.id !== seededFromUserId) {
    setSeededFromUserId(user.id);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setOtherNames(user.otherNames ?? "");
    setEmail(user.email ?? "");
    setLocation(
      user.city
        ? {
            lat: 0,
            lng: 0,
            formattedAddress: user.city,
            city: user.city,
            region: null,
            country: null,
            countryCode: null,
            postalCode: null,
            addressLine: null,
          }
        : null
    );
  }

  // Hydrate designer fields the same way as `seededFromUserId` above —
  // setState during render (guarded by a one-shot flag) is the React 19
  // idiom for deriving state from props/queries without an effect.
  if (!designerHydrated && designerData?.designer?.designerProfile) {
    const profile = designerData.designer.designerProfile;
    const seed: DesignerFormState = {
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      specializations: profile.specializations ?? [],
      pricingMin:
        profile.pricingMin !== null && profile.pricingMin !== undefined
          ? String(Math.round(profile.pricingMin / 100))
          : "",
      pricingMax:
        profile.pricingMax !== null && profile.pricingMax !== undefined
          ? String(Math.round(profile.pricingMax / 100))
          : "",
      isAcceptingOrders: profile.isAcceptingOrders,
    };
    setDesigner(seed);
    setDesignerSnapshot(seed);
    setDesignerHydrated(true);
  }

  // Dirty detection
  const accountDirty =
    !!user &&
    ((firstName.trim() || null) !== (user.firstName ?? null) ||
      (lastName.trim() || null) !== (user.lastName ?? null) ||
      (otherNames.trim() || null) !== (user.otherNames ?? null) ||
      (email.trim() || null) !== (user.email ?? null) ||
      (location?.city ?? null) !== (user.city ?? null) ||
      // Treat a fresh map pick (non-zero lat/lng) as dirty even if city
      // happens to be the same — region/lat/lng/country may have changed.
      !!(location && location.lat !== 0 && location.lng !== 0));

  const designerDirty =
    designerHydrated &&
    (designer.displayName !== designerSnapshot.displayName ||
      designer.bio !== designerSnapshot.bio ||
      designer.pricingMin !== designerSnapshot.pricingMin ||
      designer.pricingMax !== designerSnapshot.pricingMax ||
      designer.isAcceptingOrders !== designerSnapshot.isAcceptingOrders ||
      designer.specializations.length !==
        designerSnapshot.specializations.length ||
      designer.specializations.some(
        (s) => !designerSnapshot.specializations.includes(s)
      ));

  const isDirty = accountDirty || designerDirty;
  const saving = savingInfo || savingProfile;

  // Autosave draft so a refresh / session expiry doesn't lose work
  // (per docs/journeys/05-failure-modes.md §1.1).
  const { restored: draftRestored, clear: clearDraft } = useAutosave(
    `nidlo:draft:profile:${user?.id ?? "anon"}`,
    { firstName, lastName, otherNames, email, location, designer },
    { enabled: isDirty }
  );

  // One-shot toast prompt if a draft was saved from a prior session.
  useEffect(() => {
    if (!draftRestored || !user) return;
    const sameAccount =
      draftRestored.firstName === (user.firstName ?? "") &&
      draftRestored.lastName === (user.lastName ?? "") &&
      draftRestored.otherNames === (user.otherNames ?? "") &&
      draftRestored.email === (user.email ?? "") &&
      (draftRestored.location?.city ?? null) === (user.city ?? null);
    if (sameAccount) return;
    toast("Resume editing?", {
      description: "We saved your unsaved changes from last time.",
      action: {
        label: "Resume",
        onClick: () => {
          setFirstName(draftRestored.firstName);
          setLastName(draftRestored.lastName);
          setOtherNames(draftRestored.otherNames);
          setEmail(draftRestored.email ?? "");
          setLocation(draftRestored.location ?? null);
          if (draftRestored.designer) {
            setDesigner(draftRestored.designer);
          }
        },
      },
      duration: 10_000,
    });
  }, [draftRestored, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const { data } = await updateAvatar({ variables: { file } });
      if (data?.updateAvatar) {
        setUser({ ...user!, avatarUrl: data.updateAvatar.avatarUrl });
        toast.success("Avatar updated");
      }
    } catch {
      toast.error("Failed to upload avatar");
      setAvatarPreview(null);
    }
  };

  const MAX_PORTFOLIO = 20;
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const currentImages: PortfolioImage[] =
    designerData?.designer?.designerProfile?.portfolioImages ?? [];

  const uploadPortfolioFile = async (
    file: File
  ): Promise<{ ok: true } | { ok: false; reason: string }> => {
    try {
      const { data } = await addPortfolioImage({ variables: { file } });
      if (data?.addPortfolioImage) return { ok: true };
      return { ok: false, reason: "Server didn't return the updated profile." };
    } catch (err) {
      return {
        ok: false,
        reason:
          err instanceof Error ? err.message : "Upload failed. Try again.",
      };
    }
  };

  const handlePortfolioFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PORTFOLIO - currentImages.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) {
      toast.error(`Maximum ${MAX_PORTFOLIO} images allowed`);
      return;
    }
    setPortfolioUploading(true);
    try {
      for (const file of toUpload) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setPortfolioFailed((prev) => [
            ...prev,
            {
              id: `${file.name}-${Date.now()}`,
              file,
              reason: "Only JPEG, PNG, and WebP are accepted.",
            },
          ]);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setPortfolioFailed((prev) => [
            ...prev,
            {
              id: `${file.name}-${Date.now()}`,
              file,
              reason: "File exceeds the 10 MB limit.",
            },
          ]);
          continue;
        }
        const result = await uploadPortfolioFile(file);
        if (!result.ok) {
          setPortfolioFailed((prev) => [
            ...prev,
            { id: `${file.name}-${Date.now()}`, file, reason: result.reason },
          ]);
        }
      }
    } finally {
      setPortfolioUploading(false);
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
    }
  };

  const handlePortfolioRetry = async (entry: FailedUpload) => {
    const result = await uploadPortfolioFile(entry.file);
    if (result.ok) {
      setPortfolioFailed((prev) => prev.filter((f) => f.id !== entry.id));
    } else {
      setPortfolioFailed((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, reason: result.reason } : f
        )
      );
    }
  };

  const handleRemovePortfolioImage = async (index: number) => {
    setRemovingIndex(index);
    try {
      await removePortfolioImage({ variables: { index } });
    } catch {
      toast.error("Failed to remove image. Try again.");
    } finally {
      setRemovingIndex(null);
    }
  };

  const toggleSpec = (slug: string) => {
    setDesigner((d) =>
      d.specializations.includes(slug)
        ? { ...d, specializations: d.specializations.filter((s) => s !== slug) }
        : { ...d, specializations: [...d.specializations, slug] }
    );
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      // Account basics (UpdateMyInfoInput). Only send fields that actually
      // changed so we don't accidentally null something on the backend.
      if (accountDirty) {
        const input: Record<string, unknown> = {
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          otherNames: otherNames.trim() || null,
          email: email.trim() || null,
        };
        if (location) {
          input.city = location.city;
          input.region = location.region;
          input.postalCode = location.postalCode;
          input.formattedAddress = location.formattedAddress;
          input.countryCode = location.countryCode;
          input.addressLine = location.addressLine;
          // Only forward lat/lng for fresh map picks (lat 0/0 means we
          // synthesised the LocationData from the stored city string).
          if (location.lat !== 0 || location.lng !== 0) {
            input.locationLat = location.lat;
            input.locationLng = location.lng;
          }
        }
        await updateMyInfo({ variables: { input } });
        setUser({
          ...user,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          otherNames: otherNames.trim() || null,
          email: email.trim() || null,
          city: location?.city ?? user.city,
        });
      }

      // Designer profile (UpdateProfileInput).
      if (designerDirty && user.isDesigner) {
        const min = parsePricing(designer.pricingMin);
        const max = parsePricing(designer.pricingMax);
        if (min !== null && max !== null && min > max) {
          toast.error("Minimum price must be less than or equal to maximum");
          return;
        }
        await updateProfile({
          variables: {
            input: {
              displayName: designer.displayName.trim() || null,
              bio: designer.bio.trim() || null,
              specializations: designer.specializations,
              pricingMin: min,
              pricingMax: max,
              isAcceptingOrders: designer.isAcceptingOrders,
            },
          },
        });
        setDesignerSnapshot(designer);
      }

      clearDraft();
      toast.success("Profile updated");
      router.push("/profile");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const displayAvatar = avatarPreview ?? user.avatarUrl;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-7">
        <div>
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to profile
          </Link>
          <header className="mt-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Account
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Edit profile
            </h1>
          </header>
        </div>

        {/* Avatar */}
        <GlassCard
          variant="solid"
          className="flex flex-col items-center gap-4 p-6"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label={uploadingAvatar ? "Uploading avatar" : "Change avatar"}
            className="group bg-secondary ring-background relative size-28 overflow-hidden rounded-full shadow-(--shadow-2) ring-2 transition-shadow hover:shadow-(--shadow-glow) disabled:cursor-wait"
          >
            {displayAvatar ? (
              // FileReader data URL preview is unoptimisable by next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="text-muted-foreground h-12 w-12" aria-hidden />
              </div>
            )}
            {uploadingAvatar ? (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <Loader2 className="h-7 w-7 animate-spin text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <Camera className="h-7 w-7 text-white" aria-hidden />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="Upload avatar image"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-muted-foreground text-xs">
            {uploadingAvatar ? "Uploading..." : "Tap photo to change"}
          </p>
        </GlassCard>

        {/* Account basics */}
        <section>
          <header className="mb-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Identity
            </p>
            <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              Personal information
            </h2>
          </header>
          <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">
                  First name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Adwoa"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mensah"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherNames" className="text-sm">
                Other names{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="otherNames"
                value={otherNames}
                onChange={(e) => setOtherNames(e.target.value)}
                placeholder="Middle name or other names"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email{" "}
                <span className="text-muted-foreground">
                  (for receipts &amp; order updates)
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <LocationPicker
                value={location}
                onChange={setLocation}
                label="Location"
                placeholder="Search your area, neighbourhood, or city"
                showMap
                mapHeight="220px"
              />
            </div>
          </GlassCard>
        </section>

        {/* Designer profile */}
        {user.isDesigner && (
          <section>
            <header className="mb-4">
              <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
                Shop
              </p>
              <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                <span className="inline-flex items-center gap-2">
                  <Scissors className="text-copper h-5 w-5" aria-hidden />
                  Designer profile
                </span>
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                What clients see on your public profile.
              </p>
            </header>
            <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
              {designerLoading && !designerHydrated ? (
                <div className="space-y-4">
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm">
                      Shop name
                    </Label>
                    <Input
                      id="displayName"
                      value={designer.displayName}
                      onChange={(e) =>
                        setDesigner((d) => ({
                          ...d,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="Adwoa Couture"
                      className="h-11"
                    />
                    <p className="text-muted-foreground text-xs">
                      Public business name. Used in your shareable profile link.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={designer.bio}
                      onChange={(e) =>
                        setDesigner((d) => ({ ...d, bio: e.target.value }))
                      }
                      placeholder="Tell clients about your craft, signature styles, turnaround times..."
                      maxLength={500}
                      rows={4}
                      className="min-h-24"
                    />
                    <p className="text-muted-foreground text-right text-xs">
                      {designer.bio.length}/500
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Specializations</Label>
                    <p className="text-muted-foreground text-xs">
                      Clients filter by these. Pick everything you actively
                      make.
                    </p>
                    {specsLoading ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-9 w-24 rounded-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {allSpecs.map((spec) => {
                          const selected = designer.specializations.includes(
                            spec.slug
                          );
                          return (
                            <button
                              key={spec.id}
                              type="button"
                              onClick={() => toggleSpec(spec.slug)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                                selected
                                  ? "bg-foreground text-background hover:bg-foreground/85"
                                  : "border-border bg-card hover:border-foreground/30 border hover:-translate-y-0.5 hover:shadow-(--shadow-1)"
                              )}
                              aria-pressed={selected}
                            >
                              {selected ? (
                                <X className="h-3 w-3" aria-hidden />
                              ) : (
                                <Plus
                                  className="text-copper h-3 w-3"
                                  aria-hidden
                                />
                              )}
                              {spec.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Typical price range (GHS)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Min"
                        value={designer.pricingMin}
                        onChange={(e) =>
                          setDesigner((d) => ({
                            ...d,
                            pricingMin: e.target.value,
                          }))
                        }
                        className="h-11"
                        aria-label="Minimum price in GHS"
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Max"
                        value={designer.pricingMax}
                        onChange={(e) =>
                          setDesigner((d) => ({
                            ...d,
                            pricingMax: e.target.value,
                          }))
                        }
                        className="h-11"
                        aria-label="Maximum price in GHS"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      A rough guide. Final quotes are still per-order.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed p-3.5">
                    <div className="min-w-0 flex-1">
                      <Label
                        htmlFor="isAcceptingOrders"
                        className="cursor-pointer text-sm font-medium"
                      >
                        Accepting new orders
                      </Label>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Switch off when you&apos;re fully booked. Your profile
                        stays visible.
                      </p>
                    </div>
                    <Switch
                      id="isAcceptingOrders"
                      checked={designer.isAcceptingOrders}
                      onCheckedChange={(checked) =>
                        setDesigner((d) => ({
                          ...d,
                          isAcceptingOrders: checked,
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </GlassCard>
          </section>
        )}

        {/* Portfolio */}
        {user.isDesigner && (
          <section>
            <header className="mb-4">
              <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
                Portfolio
              </p>
              <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                Your work
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                3+ photos unlock search visibility and get 5× more inquiries.
              </p>
            </header>
            <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
              {/* Counter */}
              <p className="text-sm">
                <span className="font-semibold tabular-nums">
                  {currentImages.length}
                </span>
                <span className="text-muted-foreground">
                  /{MAX_PORTFOLIO} uploaded
                  {currentImages.length < 3 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="text-copper font-medium">
                        {3 - currentImages.length} more needed
                      </span>
                    </>
                  )}
                </span>
              </p>

              {/* Existing images */}
              {currentImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {currentImages.map((img, i) => (
                    <div
                      key={img.public_id ?? i}
                      className="ring-border relative aspect-square overflow-hidden rounded-xl ring-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.thumbnail_url ?? img.url}
                        alt={img.caption ?? `Portfolio ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioImage(i)}
                        disabled={removingIndex === i || removingImage}
                        aria-label={`Remove portfolio image ${i + 1}`}
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-opacity hover:bg-black/80 disabled:cursor-wait"
                      >
                        {removingIndex === i ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" aria-hidden />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              {currentImages.length < MAX_PORTFOLIO && (
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setPortfolioDragOver(false);
                    void handlePortfolioFiles(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPortfolioDragOver(true);
                  }}
                  onDragLeave={() => setPortfolioDragOver(false)}
                  className={cn(
                    "relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200",
                    portfolioDragOver
                      ? "border-copper bg-copper/5"
                      : "border-border hover:border-foreground/30 hover:bg-card/40"
                  )}
                >
                  <span className="bg-secondary text-foreground mx-auto flex size-12 items-center justify-center rounded-2xl">
                    <Upload className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-medium">
                    Drag &amp; drop, or pick from your device
                  </p>
                  <Button
                    type="button"
                    variant="luxe-outline"
                    size="sm"
                    className="mt-3"
                    loading={portfolioUploading}
                    loadingLabel="Uploading..."
                    onClick={() => portfolioInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Add photos
                  </Button>
                  <input
                    ref={portfolioInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    aria-label="Upload portfolio images"
                    onChange={(e) => void handlePortfolioFiles(e.target.files)}
                  />
                  <p className="text-muted-foreground mt-2 text-xs">
                    JPEG, PNG, or WebP · max 10 MB each
                  </p>
                </div>
              )}

              {/* Failed uploads */}
              {portfolioFailed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-status-error-fg text-sm font-medium">
                    {portfolioFailed.length} upload
                    {portfolioFailed.length === 1 ? "" : "s"} failed
                  </p>
                  <ul className="space-y-2">
                    {portfolioFailed.map((entry) => (
                      <li
                        key={entry.id}
                        className="border-status-error-soft bg-status-error-soft/40 flex items-center gap-3 rounded-2xl border p-3"
                      >
                        <AlertCircle className="text-status-error h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {entry.file.name}
                          </p>
                          <p className="text-status-error-fg text-xs">
                            {entry.reason}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handlePortfolioRetry(entry)}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
                          Retry
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Dismiss ${entry.file.name}`}
                          onClick={() =>
                            setPortfolioFailed((prev) =>
                              prev.filter((f) => f.id !== entry.id)
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>
          </section>
        )}

        {/* Completeness indicator (designer only) */}
        {user.isDesigner && designerHydrated && (
          <section>
            <header className="mb-4">
              <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
                Visibility
              </p>
              <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                Profile completeness
              </h2>
            </header>
            <GlassCard variant="solid" className="space-y-4 p-5 sm:p-6">
              {(() => {
                const score =
                  designerData?.designer?.designerProfile
                    ?.profileCompleteness ?? 0;
                const profile = designerData?.designer?.designerProfile;
                const u = user;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {score >= 70
                          ? "You appear in search"
                          : "Complete to unlock search"}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          score >= 70 ? "text-status-success" : "text-copper"
                        )}
                      >
                        {score}%
                      </span>
                    </div>
                    <div className="bg-border h-2 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          score >= 70 ? "bg-status-success" : "bg-copper"
                        )}
                        style={{ width: `${Math.min(score, 100)}%` }}
                        role="progressbar"
                        aria-valuenow={score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Profile ${score}% complete`}
                      />
                    </div>
                    <ul className="space-y-2 text-sm">
                      {[
                        {
                          done: !!u.avatarUrl,
                          label: "Profile photo",
                          pts: 10,
                        },
                        { done: !!profile?.bio, label: "Bio", pts: 15 },
                        {
                          done: (profile?.portfolioImages?.length ?? 0) >= 3,
                          label: "3+ portfolio photos",
                          pts: 25,
                        },
                        {
                          done: (profile?.specializations?.length ?? 0) > 0,
                          label: "Specializations",
                          pts: 15,
                        },
                        {
                          done: !!profile?.pricingMin && !!profile?.pricingMax,
                          label: "Pricing range",
                          pts: 15,
                        },
                        { done: !!u.city, label: "Location", pts: 10 },
                        {
                          done: (profile?.ordersCompleted ?? 0) > 0,
                          label: "First order completed",
                          pts: 10,
                        },
                      ].map(({ done, label, pts }) => (
                        <li
                          key={label}
                          className={cn(
                            "flex items-center gap-2",
                            done ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                              done
                                ? "bg-status-success/15 text-status-success"
                                : "bg-border text-muted-foreground"
                            )}
                            aria-hidden
                          >
                            {done ? "✓" : "·"}
                          </span>
                          <span className="flex-1">{label}</span>
                          <span className="text-muted-foreground tabular-nums">
                            +{pts}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </GlassCard>
          </section>
        )}

        {/* Save */}
        <Button
          variant="luxe"
          size="xl"
          className="w-full gap-1.5"
          onClick={handleSave}
          disabled={!isDirty}
          loading={saving}
          loadingLabel="Saving..."
        >
          {isDirty ? (
            <>
              Save changes
              <Check className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Saved
            </>
          )}
        </Button>
      </div>
    </AppShell>
  );
}

/**
 * GHS-decimal input → pesewas integer for the API. Empty input becomes
 * null so the backend can clear the field; non-numeric stays null.
 */
function parsePricing(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}
