"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { ArrowLeft, Loader2, Camera, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useAutosave } from "@/lib/hooks/use-autosave";
import { useAuthStore } from "@/lib/stores/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [updateAvatar, { loading: uploadingAvatar }] = useMutation<{ updateAvatar: { id: string; avatarUrl: string | null } }>(UPDATE_AVATAR, {
    refetchQueries: [{ query: ME_QUERY }],
  });
  const [createCity] = useMutation<CreateCityData>(CREATE_CITY);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setOtherNames(user.otherNames ?? "");
      setCity(user.city ?? "");
    }
  }, [user]);

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
      (draftRestored.showNewCity ? draftRestored.newCity : draftRestored.city) !==
        (user.city ?? "");
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

    // Preview
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

      // Create new city if needed
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

      // Update local auth store
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  const displayAvatar = avatarPreview ?? user.avatarUrl;
  const cities = citiesData?.cities ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile" aria-label="Back to profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Avatar */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label={uploadingAvatar ? "Uploading avatar" : "Change avatar"}
              className="group relative h-24 w-24 overflow-hidden rounded-full bg-muted disabled:cursor-wait"
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
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              {uploadingAvatar ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 flex items-center justify-center bg-black/60"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-muted-foreground">
              {uploadingAvatar ? "Uploading..." : "Tap to change photo"}
            </p>
          </CardContent>
        </Card>

        {/* Name fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherNames">Other Names</Label>
              <Input
                id="otherNames"
                value={otherNames}
                onChange={(e) => setOtherNames(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>City</Label>
              {!showNewCity ? (
                <div className="space-y-2">
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
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
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setShowNewCity(true)}
                  >
                    City not listed? Add new
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Enter city name"
                  />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
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
          </CardContent>
        </Card>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving || !personalInfoDirty}
          className="w-full"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {personalInfoDirty ? "Save Changes" : "Saved"}
        </Button>
      </div>
    </AppShell>
  );
}
