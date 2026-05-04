import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "You're offline",
  description: "Nidlo can't reach the network right now.",
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Nidlo can&apos;t reach the network right now. Once your connection is
        back, you&apos;ll be able to browse designers and place orders again.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">Try the home page</Link>
        </Button>
      </div>
    </main>
  );
}
