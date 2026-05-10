"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";

import { REQUEST_OTP, SOCIAL_LOGIN } from "@/lib/graphql/mutations/auth";
import { GET_COUNTRIES } from "@/lib/graphql/queries/designer";
import type {
  RequestOtpData,
  SocialLoginData,
  CountriesData,
  GqlCountry,
} from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { useGuestGuard } from "@/lib/hooks/use-guest-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleSignInButton } from "./google-sign-in-button";

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

const FALLBACK_COUNTRIES: GqlCountry[] = [
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

export default function PhoneAuthPage() {
  const { isGuest, isLoading } = useGuestGuard();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [selectedCode, setSelectedCode] = useState("+233");
  const [requestOtp, { loading }] = useMutation(REQUEST_OTP);
  const [socialLogin, { loading: socialLoading }] = useMutation(SOCIAL_LOGIN);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: countriesData } = useQuery<CountriesData>(GET_COUNTRIES, {
    variables: { activeOnly: true },
    fetchPolicy: "cache-first",
  });

  const countries = useMemo(() => {
    const fetched = countriesData?.countries ?? [];
    return fetched.length > 0 ? fetched : FALLBACK_COUNTRIES;
  }, [countriesData]);

  const selectedCountry = useMemo(
    () =>
      countries.find((c) => `+${c.phoneCode}` === selectedCode) ?? countries[0],
    [countries, selectedCode]
  );

  const maxDigits = selectedCountry?.phoneDigits ?? 10;
  const startsWithZero = selectedCountry?.phoneStartsWithZero ?? true;
  const minDigits = startsWithZero ? maxDigits - 1 : maxDigits;

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.slice(0, maxDigits);
  };

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (startsWithZero) {
      return (
        (digits.length === maxDigits && digits.startsWith("0")) ||
        (digits.length === minDigits && !digits.startsWith("0"))
      );
    }
    return digits.length === maxDigits;
  };

  const toInternational = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const withoutLeadingZero = digits.startsWith("0")
      ? digits.slice(1)
      : digits;
    return `${selectedCode}${withoutLeadingZero}`;
  };

  const handleSocialLogin = useCallback(
    async (provider: string, token: string) => {
      try {
        const { data } = await socialLogin({
          variables: { provider, token },
        });
        const result = data as SocialLoginData | undefined;

        if (result?.socialLogin) {
          const { user, isNew } = result.socialLogin;
          setUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone || "",
            email: user.email,
            avatarUrl: user.avatarUrl,
            city: user.city,
            isDesigner: user.isDesigner,
            isOnboarded: user.isOnboarded,
          });

          toast.success("Signed in successfully!");

          if (isNew || !user.isOnboarded) {
            router.push("/auth/role");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Social login failed";
        toast.error(message);
      }
    },
    [socialLogin, setUser, router]
  );

  const handleAppleLogin = useCallback(async () => {
    if (!APPLE_CLIENT_ID) {
      toast.info("Apple Sign-In is not configured yet.");
      return;
    }

    try {
      if (!window.AppleID) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Apple SDK"));
          document.head.appendChild(script);
        });
      }

      window.AppleID!.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: true,
      });

      const response = await window.AppleID!.auth.signIn();
      await handleSocialLogin("apple", response.authorization.id_token);
    } catch (error) {
      if (error instanceof Error && error.message !== "popup_closed_by_user") {
        toast.error("Apple sign-in failed. Please try again.");
      }
    }
  }, [handleSocialLogin]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      const digitHint =
        startsWithZero && minDigits !== maxDigits
          ? `${minDigits} or ${maxDigits}`
          : `${maxDigits}`;
      toast.error(
        `Please enter a valid ${digitHint}-digit ${selectedCountry?.name ?? ""} phone number`
      );
      return;
    }

    const internationalPhone = toInternational(phone);

    try {
      const { data } = await requestOtp({
        variables: { phone: internationalPhone },
      });
      const result = data as RequestOtpData | undefined;

      if (result?.requestOtp.success) {
        toast.success("Verification code sent!");
        // Phone is the primary login credential — keep it out of URLs,
        // browser history, Referer headers, and access logs. sessionStorage
        // is per-tab and clears on close; the verify page reads it once.
        sessionStorage.setItem("nidlo:auth:pendingPhone", internationalPhone);
        router.push("/auth/verify");
      } else {
        toast.error(result?.requestOtp.message || "Failed to send code");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    }
  };

  if (isLoading || !isGuest) {
    return (
      <GlassCard variant="solid" className="p-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton className="mt-8 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-full" />
        <Skeleton className="mt-6 h-px w-full" />
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-full" />
      </GlassCard>
    );
  }

  const isBusy = loading || socialLoading;
  const placeholder =
    selectedCountry?.phonePlaceholder ??
    (startsWithZero ? "024 123 4567" : "90 12 34 56");

  return (
    <GlassCard variant="solid" className="p-8">
      <header className="mb-7">
        <h1 className="text-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          Welcome back.
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          We&apos;ll text you a 6-digit code to verify your number.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="phone-input"
          className="text-muted-foreground block text-[11px] font-semibold tracking-[0.16em] uppercase"
        >
          Phone number
        </label>
        <div className="flex gap-2">
          <Select value={selectedCode} onValueChange={setSelectedCode}>
            <SelectTrigger className="border-border bg-background/60 h-12! w-32 shrink-0 rounded-xl text-sm font-medium">
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
              id="phone-input"
              type="tel"
              placeholder={placeholder}
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              maxLength={maxDigits}
              autoFocus
              autoComplete="tel"
              inputMode="numeric"
              className="bg-background/60 h-12 rounded-xl pl-9 text-base font-medium tabular-nums"
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="luxe"
          size="lg"
          className="w-full"
          disabled={isBusy || !isValidPhone(phone)}
        >
          {loading ? "Sending..." : "Send verification code"}
          {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
        </Button>
      </form>

      <ThreadDivider tone="copper" label="OR" className="my-7" />

      <div className="grid gap-2.5">
        <GoogleSignInButton
          disabled={isBusy}
          loading={socialLoading}
          onToken={(token) => handleSocialLogin("google", token)}
        />
        <Button
          type="button"
          variant="luxe-outline"
          size="lg"
          className="w-full"
          disabled={isBusy}
          onClick={handleAppleLogin}
        >
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {socialLoading ? "Signing in..." : "Continue with Apple"}
        </Button>
      </div>

      <p className="text-muted-foreground mt-7 text-center text-xs">
        By continuing you agree to our{" "}
        <a
          href="/terms"
          className="text-foreground/80 font-medium underline-offset-4 hover:underline"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="text-foreground/80 font-medium underline-offset-4 hover:underline"
        >
          Privacy
        </a>
        .
      </p>
    </GlassCard>
  );
}
