import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BellOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UnsubscribeContent } from "./content";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Manage your Nidlo email preferences.",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <BellOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <Suspense
        fallback={
          <>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-3 h-4 w-72" />
          </>
        }
      >
        <UnsubscribeContent />
      </Suspense>
      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href="/notifications/preferences">
            <Settings className="mr-2 h-4 w-4" />
            Manage all preferences
          </Link>
        </Button>
      </div>
    </main>
  );
}
