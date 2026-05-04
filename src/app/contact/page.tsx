import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Nidlo team.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Contact Us</h1>
      <p className="mb-8 text-muted-foreground">
        We&apos;re here to help. Reach out via any of the channels below.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-1 text-lg font-semibold">General Support</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Questions about orders, accounts, or platform features.
          </p>
          <a
            href="mailto:support@nidlo.com"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            support@nidlo.com
          </a>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-1 text-lg font-semibold">Designer Partnerships</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Interested in joining Nidlo as a designer or workshop?
          </p>
          <a
            href="mailto:designers@nidlo.com"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            designers@nidlo.com
          </a>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-1 text-lg font-semibold">Legal &amp; Privacy</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Data requests, takedown notices, or legal correspondence.
          </p>
          <a
            href="mailto:legal@nidlo.com"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            legal@nidlo.com
          </a>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-1 text-lg font-semibold">Press &amp; Media</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Media enquiries, brand assets, and partnership proposals.
          </p>
          <a
            href="mailto:press@nidlo.com"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            press@nidlo.com
          </a>
        </div>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        We aim to respond within 1–2 business days. For urgent order issues, please include your
        order ID in the subject line.
      </p>
    </main>
  );
}
