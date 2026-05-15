"use client";

import { User, Sparkles, MapPin } from "lucide-react";

import { useOnboardingStore } from "@/lib/stores/onboarding";
import { LocationPicker } from "@/components/shared/location-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LocationData } from "@/types/location";

export function StepBasicInfo() {
  const {
    firstName,
    lastName,
    otherNames,
    displayName,
    bio,
    location,
    yearsOfExperience,
    setField,
  } = useOnboardingStore();

  const handleLocationChange = (loc: LocationData) => {
    setField("location", loc);
    setField("locationLat", loc.lat);
    setField("locationLng", loc.lng);
    if (loc.city) {
      setField("city", loc.city);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        icon={User}
        title="Who are you?"
        subtitle="Your real name builds trust with clients. Your business name is what they see."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor="firstName" label="First name" required>
          <Input
            id="firstName"
            placeholder="Kofi"
            value={firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            maxLength={100}
            className="h-11"
          />
        </Field>
        <Field htmlFor="lastName" label="Last name" required>
          <Input
            id="lastName"
            placeholder="Mensah"
            value={lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            maxLength={100}
            className="h-11"
          />
        </Field>
      </div>

      <Field
        htmlFor="otherNames"
        label="Other names"
        hint="Middle name or other names (optional)"
      >
        <Input
          id="otherNames"
          placeholder="Add a middle name"
          value={otherNames}
          onChange={(e) => setField("otherNames", e.target.value)}
          maxLength={100}
          className="h-11"
        />
      </Field>

      <Field
        htmlFor="displayName"
        label="Business / display name"
        hint="The name clients see. If blank, we use your full name."
      >
        <Input
          id="displayName"
          placeholder="Kofi's Designs"
          value={displayName}
          onChange={(e) => setField("displayName", e.target.value)}
          maxLength={100}
          className="h-11"
        />
      </Field>

      <Field
        htmlFor="bio"
        label="About your craft"
        hint={`${bio.length}/500 characters · clients with bios get 3× more inquiries`}
      >
        <Textarea
          id="bio"
          placeholder="Tell clients about your experience, your style, what makes your work unique..."
          value={bio}
          onChange={(e) => setField("bio", e.target.value)}
          rows={4}
          maxLength={500}
          className="resize-none"
        />
      </Field>

      <SectionHeading
        icon={Sparkles}
        title="How long have you been making clothes?"
        subtitle="Years of experience tell clients you've been at this for a while."
        compact
      />
      <Field htmlFor="yearsOfExperience" label="Years of experience">
        <Input
          id="yearsOfExperience"
          type="number"
          min="0"
          max="50"
          placeholder="5"
          value={yearsOfExperience}
          onChange={(e) => setField("yearsOfExperience", e.target.value)}
          className="h-11 w-32 tabular-nums"
        />
      </Field>

      <SectionHeading
        icon={MapPin}
        title="Where do you work from?"
        subtitle="Your workshop location helps clients find designers near them."
        compact
      />
      <LocationPicker
        value={location}
        onChange={handleLocationChange}
        label="Workshop / business location"
        placeholder="Search for your workshop area..."
        showMap
        mapHeight="240px"
      />
    </div>
  );
}

interface SectionHeadingProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  subtitle?: string;
  compact?: boolean;
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  compact = false,
}: SectionHeadingProps) {
  // Compact mode stacks icon+title above subtitle on mobile (no horizontal
  // squish on narrow viewports), then lays them out side-by-side from `sm`
  // up with the subtitle floated right.
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          : "space-y-2"
      }
    >
      <div className="flex items-center gap-3">
        <span className="bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && !compact && (
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {subtitle && compact && (
        <p className="text-muted-foreground pl-12 text-xs sm:ml-auto sm:max-w-xs sm:pl-0 sm:text-right">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface FieldProps {
  htmlFor: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ htmlFor, label, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-1 text-sm">
        {label}
        {required && (
          <span className="text-copper" aria-label="required">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
