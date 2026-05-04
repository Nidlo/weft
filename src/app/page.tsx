import { AppShell } from "@/components/layout/app-shell";
import { HomeDiscovery } from "@/components/shared/home-discovery";
import { HeroCta } from "@/components/shared/hero-cta";

export default function Home() {
  return (
    <AppShell>
      {/* Hero — server-rendered, no client JS for the static copy */}
      <div className="flex flex-col items-center py-12 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Nidlo — Where every stitch begins.
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Custom Fashion,{" "}
          <span className="text-primary">Connected</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Find talented seamstresses, tailors, and fashion designers in Ghana.
          Specify your garment, track production, and pay securely.
        </p>
        <HeroCta />
      </div>

      {/* Discovery Sections */}
      <div className="pb-12">
        <HomeDiscovery />
      </div>
    </AppShell>
  );
}
