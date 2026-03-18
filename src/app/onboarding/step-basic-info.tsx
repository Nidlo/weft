"use client";

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="e.g. Kofi"
            value={firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="e.g. Mensah"
            value={lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherNames">Other Names</Label>
        <Input
          id="otherNames"
          placeholder="Middle name or other names (optional)"
          value={otherNames}
          onChange={(e) => setField("otherNames", e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Business / Display Name</Label>
        <Input
          id="displayName"
          placeholder="e.g. Kofi's Designs (optional)"
          value={displayName}
          onChange={(e) => setField("displayName", e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          This is the name clients will see. If blank, your full name is used.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell clients about your experience, style, and what makes you unique..."
          value={bio}
          onChange={(e) => setField("bio", e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {bio.length}/500 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
        <Input
          id="yearsOfExperience"
          type="number"
          min="0"
          max="50"
          placeholder="e.g. 5"
          value={yearsOfExperience}
          onChange={(e) => setField("yearsOfExperience", e.target.value)}
          className="w-32"
        />
      </div>

      <LocationPicker
        value={location}
        onChange={handleLocationChange}
        label="Workshop / Business Location"
        placeholder="Search for your workshop area..."
        showMap
        mapHeight="250px"
      />
    </div>
  );
}
