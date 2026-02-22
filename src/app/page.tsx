import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { HomeDiscovery } from "@/components/shared/home-discovery";

export default function Home() {
  return (
    <AppShell>
      {/* Hero */}
      <div className="flex flex-col items-center py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Custom Fashion,{" "}
          <span className="text-primary">Connected</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Find talented seamstresses, tailors, and fashion designers.
          Specify your garment, track production, and pay securely.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/phone">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/search">Browse Designers</Link>
          </Button>
        </div>
      </div>

      {/* Discovery Sections */}
      <div className="pb-12">
        <HomeDiscovery />
      </div>
    </AppShell>
  );
}
