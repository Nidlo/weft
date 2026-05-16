"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Phone } from "lucide-react";

import { GET_COUNTRIES } from "@/lib/graphql/queries/designer";
import type { CountriesData, GqlCountry } from "@/types/graphql";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mirrors the auth phone form's fallback so a countries-query failure
// still lets a designer enter a Ghana number.
const FALLBACK: GqlCountry[] = [
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
];

interface Props {
  /** Current value as E.164 (`+233241234567`) or "" when empty. */
  value: string;
  /** Emits E.164 on every change, or "" when the local part is blank. */
  onChange: (e164: string) => void;
  id?: string;
  /** Dial code (e.g. "+233") to default to. Falls back to the first country. */
  defaultDialCode?: string;
}

/**
 * Country-aware phone input that always emits E.164.
 *
 * Why this exists: the External-client phone was a bare text input. A
 * designer typing a local number with no country code got it stored as
 * a malformed phone that never matched a real user's `users.phone`, so
 * the order could never auto-link to the client when they signed up.
 * Forcing a country selection guarantees a normalized +{cc}{local}
 * string the backend `linkOrdersByPhone` can match exactly.
 */
export function CountryPhoneInput({
  value,
  onChange,
  id = "country-phone",
  defaultDialCode,
}: Props) {
  const { data } = useQuery<CountriesData>(GET_COUNTRIES, {
    variables: { activeOnly: true },
  });
  const countries = data?.countries?.length ? data.countries : FALLBACK;

  // Split the controlled E.164 value back into (dialCode, localDigits) so
  // the component stays a pure function of `value`.
  const { dialCode, local } = useMemo(() => {
    const fallbackDial = defaultDialCode ?? `+${countries[0].phoneCode}`;
    if (!value.startsWith("+")) {
      return { dialCode: fallbackDial, local: "" };
    }
    // Longest dial code first so +1 doesn't shadow +1XXX-style codes.
    const sorted = [...countries].sort(
      (a, b) => b.phoneCode.length - a.phoneCode.length
    );
    const match = sorted.find((c) => value.startsWith(`+${c.phoneCode}`));
    if (!match) return { dialCode: fallbackDial, local: "" };
    return {
      dialCode: `+${match.phoneCode}`,
      local: value.slice(match.phoneCode.length + 1),
    };
  }, [value, countries, defaultDialCode]);

  const selectedCountry =
    countries.find((c) => `+${c.phoneCode}` === dialCode) ?? countries[0];

  const compose = (nextDial: string, nextLocalRaw: string) => {
    const digits = nextLocalRaw.replace(/\D/g, "");
    if (digits === "") {
      onChange("");
      return;
    }
    const country = countries.find((c) => `+${c.phoneCode}` === nextDial);
    // Strip a leading zero where the country writes local numbers with
    // one (e.g. Ghana 024... -> 24...), so we never double it.
    const localPart =
      country?.phoneStartsWithZero && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
    onChange(`${nextDial}${localPart}`);
  };

  return (
    <div className="flex gap-2">
      <Select value={dialCode} onValueChange={(next) => compose(next, local)}>
        <SelectTrigger
          className="h-11 w-28 shrink-0"
          aria-label="Client country dialing code"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.iso2} value={`+${c.phoneCode}`}>
              {c.emoji ?? ""} +{c.phoneCode}{" "}
              <span className="text-muted-foreground">{c.iso2}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Phone
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={selectedCountry.phonePlaceholder ?? "24 123 4567"}
          value={local}
          onChange={(e) => compose(dialCode, e.target.value)}
          className="h-11 pl-9 tabular-nums"
        />
      </div>
    </div>
  );
}
