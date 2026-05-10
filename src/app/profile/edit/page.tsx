"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { ArrowLeft, Camera, Check, Loader2, MapPin, User } from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useAutosave } from "@/lib/hooks/use-autosave";
import { useAuthStore } from "@/lib/stores/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GET_CITIES } from "@/lib/graphql/queries/designer";
import { CREATE_CITY } from "@/lib/graphql/mutations/lookup";
import { UPDATE_MY_INFO, UPDATE_AVATAR } from "@/lib/graphql/mutations/profile";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type { CitiesData, CreateCityData } from "@/types/graphql";

export default function ProfileEditPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [city, setCity] = useState("");
  const [newCity, setNewCity] = useState("");
  const [showNewCity, setShowNewCity] = useState(false);
  // Track which user.id we've already seeded the form from. Setting state
  // during render — guarded by a condition that only fires when the source
  // changes — is the React 19 idiomatic way to derive form state from a
  // prop without using an effect (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [seededFromUserId, setSeededFromUserId] = useState<
    string | undefined
  >();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: citiesData } = useQuery<CitiesData>(GET_CITIES, {
    variables: { countryCode: "GH" },
    skip: !isReady,
    fetchPolicy: "cache-first",
  });

  const [updateMyInfo, { loading: saving }] = useMutation(UPDATE_MY_INFO, {
    refetchQueries: [{ query: ME_QUERY }],
  });
  const [updateAvatar, { loading: uploadingAvatar }] = useMutation<{
    updateAvatar: { id: string; avatarUrl: string | null };
  }>(UPDATE_AVATAR, {
    refetchQueries: [{ query: ME_QUERY }],
  });
  const [createCity] = useMutation<CreateCityData>(CREATE_CITY);

  if (user && user.id !== seededFromUserId) {
    setSeededFromUserId(user.id);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setOtherNames(user.otherNames ?? "");
    setCity(user.city ?? "");
  }

  const personalInfoDirty =
    !!user &&
    ((firstName.trim() || null) !== (user.firstName ?? null) ||
      (lastName.trim() || null) !== (user.lastName ?? null) ||
      (otherNames.trim() || null) !== (user.otherNames ?? null) ||
      ((showNewCity ? newCity.trim() : city) || null) !== (user.city ?? null));

  // Persist a draft so a session-expiry mid-edit doesn't lose unsaved name +
  // city changes (per docs/journeys/05-failure-modes.md §1.1). We only enable
  // autosave once the user has actually modified something — otherwise the
  // initial sync from `user` would write a redundant draft on every mount.
  const { restored: draftRestored, clear: clearDraft } = useAutosave(
    `nidlo:draft:profile:${user?.id ?? "anon"}`,
    { firstName, lastName, otherNames, city, newCity, showNewCity },
    { enabled: personalInfoDirty }
  );

  // One-shot toast prompt if a draft is found that differs from server state.
  useEffect(() => {
    if (!draftRestored || !user) return;
    const draftDiffersFromUser =
      draftRestored.firstName !== (user.firstName ?? "") ||
      draftRestored.lastName !== (user.lastName ?? "") ||
      draftRestored.otherNames !== (user.otherNames ?? "") ||
      (draftRestored.showNewCity
        ? draftRestored.newCity
        : draftRestored.city) !== (user.city ?? "");
    if (!draftDiffersFromUser) return;
    toast("Resume editing?", {
      description: "We saved your unsaved changes from last time.",
      action: {
        label: "Resume",
        onClick: () => {
          setFirstName(draftRestored.firstName);
          setLastName(draftRestored.lastName);
          setOtherNames(draftRestored.otherNames);
          setCity(draftRestored.city);
          setNewCity(draftRestored.newCity);
          setShowNewCity(draftRestored.showNewCity);
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

  const handleSave = async () => {
    try {
      let cityValue = city;

      if (showNewCity && newCity.trim()) {
        const { data: cityData } = await createCity({
          variables: { name: newCity.trim(), countryCode: "GH" },
        });
        if (cityData?.createCity) {
          cityValue = cityData.createCity.name;
        }
      }

      await updateMyInfo({
        variables: {
          input: {
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
            otherNames: otherNames.trim() || null,
            city: cityValue || null,
          },
        },
      });

      setUser({
        ...user!,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        otherNames: otherNames.trim() || null,
        city: cityValue || null,
      });

      // Submitted successfully — drop the draft so we don't keep prompting.
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
  const cities = citiesData?.cities ?? [];

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

        {/* Personal info */}
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
              <Label className="text-sm">City</Label>
              {!showNewCity ? (
                <div className="space-y-2">
                  <div className="relative">
                    <MapPin
                      className="text-copper pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2"
                      aria-hidden
                    />
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-11 pl-9">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                    onClick={() => setShowNewCity(true)}
                  >
                    City not listed? Add new
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <MapPin
                      className="text-copper absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                      aria-hidden
                    />
                    <Input
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Enter city name"
                      className="h-11 pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                    onClick={() => {
                      setShowNewCity(false);
                      setNewCity("");
                    }}
                  >
                    Select from list instead
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>
        </section>

        {/* Save */}
        <Button
          variant="luxe"
          size="xl"
          className="w-full gap-1.5"
          onClick={handleSave}
          disabled={saving || !personalInfoDirty}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving...
            </>
          ) : personalInfoDirty ? (
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
