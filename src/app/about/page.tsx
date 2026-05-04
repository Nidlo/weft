import type { Metadata } from "next";
import Link from "next/link";
import { APP_VERSION } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: "About Nidlo — where every stitch begins.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">About Nidlo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Where every stitch begins.
      </p>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          Nidlo is a marketplace that connects clients in Ghana and West Africa
          with custom fashion designers, tailors, and seamstresses. Discover by
          specialization, commission directly, supply measurements (manually
          or via our in-house Fitscan AI), pay via mobile money or card, track
          progress in real time, and receive your finished garment.
        </p>

        <h2>For designers</h2>
        <p>
          We give you a portfolio, an order pipeline, and instant payouts to
          your MoMo wallet — so you can grow beyond word-of-mouth and walk-in
          traffic without giving up control of your craft.
        </p>

        <h2>For clients</h2>
        <p>
          Browse verified designers, send detailed briefs, and watch your
          garment come together — from sketch to fabric to delivery.
        </p>

        <h2>Legal</h2>
        <ul>
          <li>
            <Link href="/terms">Terms of Service</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Build {APP_VERSION}
      </p>
    </main>
  );
}
