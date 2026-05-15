"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { Palette, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { StitchLoader } from "@/components/ui/stitch-loader";
import { GENERATE_STYLE_PROFILE } from "@/lib/graphql/mutations/style";
import { MY_STYLE_PROFILE } from "@/lib/graphql/queries/style";
import { useMeasurements } from "@/lib/hooks/use-measurements";
import { usePreferencesStore } from "@/lib/stores/preferences";
import { cn } from "@/lib/utils";
import type {
  GenerateStyleProfileData,
  MyStyleProfileData,
} from "@/types/graphql";

const BODY_SHAPE_LABEL: Record<string, string> = {
  rectangle: "Rectangle",
  hourglass: "Hourglass",
  pear: "Pear",
  inverted_triangle: "Inverted triangle",
  oval: "Oval",
};

export function StyleProfileCard() {
  const { data, loading: loadingProfile } =
    useQuery<MyStyleProfileData>(MY_STYLE_PROFILE);
  const { measurements, loading: loadingMeasurements } = useMeasurements();
  // Pass the user's preferred unit so Claude writes the summary in the
  // same unit they see everywhere else — avoids "your bust of 101 cm"
  // when the rest of the app speaks inches.
  const measurementUnit = usePreferencesStore((s) => s.measurementUnit);

  const [generate, { loading: generating }] =
    useMutation<GenerateStyleProfileData>(GENERATE_STYLE_PROFILE, {
      // Refetch the cached profile so subsequent reads see the new value.
      refetchQueries: [{ query: MY_STYLE_PROFILE }],
    });

  const profile = data?.myStyleProfile ?? null;
  const defaultMeasurement =
    measurements.find((m) => m.isDefault) ?? measurements[0] ?? null;

  const handleGenerate = async () => {
    if (!defaultMeasurement) {
      toast.error("Save a measurement first to generate your style profile.");
      return;
    }
    try {
      await generate({
        variables: {
          measurementId: defaultMeasurement.id,
          displayUnit: measurementUnit,
        },
      });
      toast.success("Style profile generated.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Couldn't generate your style profile.";
      toast.error(msg);
    }
  };

  // ---- Loading the cache ----
  if (loadingProfile && !profile) {
    return (
      <section>
        <Header />
        <GlassCard variant="solid" className="mt-4 p-8">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <StitchLoader size={24} tone="copper" />
            <p className="text-muted-foreground text-sm">
              Loading your style profile...
            </p>
          </div>
        </GlassCard>
      </section>
    );
  }

  // ---- Empty state ----
  if (!profile) {
    const cantGenerate = !loadingMeasurements && !defaultMeasurement;
    return (
      <section>
        <Header />
        <GlassCard
          variant="solid"
          className="mt-4 flex flex-col items-center gap-4 p-8 text-center"
        >
          <span className="bg-copper/15 text-copper-soft ring-copper/30 flex size-14 items-center justify-center rounded-2xl ring-1">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
          <div className="space-y-1.5">
            <h3 className="text-display text-xl font-semibold tracking-tight">
              Discover your style profile
            </h3>
            <p className="text-muted-foreground mx-auto max-w-sm text-sm">
              We&apos;ll use your saved measurements + interests to suggest
              flattering silhouettes, fabrics, and a color palette tailored to
              your shape.
            </p>
          </div>
          <Button
            type="button"
            variant="luxe"
            size="lg"
            onClick={handleGenerate}
            disabled={generating || cantGenerate}
            className="gap-2"
          >
            {generating ? (
              <>
                <StitchLoader size={16} tone="copper" />
                Working...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                {cantGenerate
                  ? "Save a measurement first"
                  : "Generate my style profile"}
              </>
            )}
          </Button>
        </GlassCard>
      </section>
    );
  }

  // ---- Result ----
  return (
    <section>
      <Header />
      <GlassCard
        variant="solid"
        className="mt-4 space-y-5 p-6 sm:p-7"
        data-testid="style-profile-card"
      >
        {/* Body shape headline + summary */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Body shape
            </p>
            <h3 className="text-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {BODY_SHAPE_LABEL[profile.bodyShape] ?? profile.bodyShape}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {profile.summary}
            </p>
          </div>
          <Button
            type="button"
            variant="luxe-outline"
            size="sm"
            onClick={handleGenerate}
            loading={generating}
            loadingLabel="Refreshing..."
            className="gap-1.5 self-start"
            aria-label="Refresh style profile"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Refresh
          </Button>
        </div>

        {/* Color palette */}
        {profile.colorPalette.length > 0 && (
          <Field label="Color palette" icon={Palette}>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.colorPalette.map((color) => (
                <span
                  key={color}
                  className="border-border/60 bg-card/40 flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs font-medium tabular-nums"
                >
                  <span
                    className="ring-border size-5 rounded-full ring-1"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  {color}
                </span>
              ))}
            </div>
          </Field>
        )}

        {/* Silhouettes */}
        {profile.flatteringSilhouettes.length > 0 && (
          <Field label="Flattering silhouettes">
            <ChipRow chips={profile.flatteringSilhouettes} />
          </Field>
        )}

        {/* Fabrics */}
        {profile.fabricRecommendations.length > 0 && (
          <Field label="Fabric recommendations">
            <ChipRow chips={profile.fabricRecommendations} />
          </Field>
        )}

        {/* Specializations */}
        {profile.recommendedSpecializations.length > 0 && (
          <Field label="Designers to explore">
            <ChipRow
              chips={profile.recommendedSpecializations.map((slug) =>
                slug.replace(/_/g, " ")
              )}
              tone="copper"
            />
          </Field>
        )}

        {profile.fromFallback && (
          <p className="bg-secondary text-muted-foreground rounded-xl px-3 py-2 text-xs">
            We&apos;re showing a default profile while AI analysis is
            unavailable. Try refreshing once your photo consent is granted.
          </p>
        )}
      </GlassCard>
    </section>
  );
}

function Header() {
  return (
    <header className="mb-1">
      <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
        Style
      </p>
      <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
        Your style profile
      </h2>
    </header>
  );
}

interface FieldProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function Field({ label, icon: Icon, children }: FieldProps) {
  return (
    <div>
      <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
        {Icon ? <Icon className="text-copper h-3 w-3" /> : null}
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipRow({
  chips,
  tone = "default",
}: {
  chips: string[];
  tone?: "default" | "copper";
}) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li
          key={chip}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
            tone === "copper"
              ? "bg-copper/15 text-copper-soft ring-copper/30 ring-1"
              : "bg-secondary text-foreground/80 ring-border ring-1"
          )}
        >
          {chip}
        </li>
      ))}
    </ul>
  );
}
