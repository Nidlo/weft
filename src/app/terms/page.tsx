import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Nidlo Terms of Service — the rules that govern your use of the platform.",
};

const EFFECTIVE_DATE = "1 May 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          Welcome to <strong>Nidlo</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using our platform
          you agree to these Terms of Service. Please read them carefully.
        </p>

        <h2>1. The Platform</h2>
        <p>
          Nidlo is a marketplace that connects clients with independent fashion designers, tailors, and
          seamstresses across Ghana and West Africa. We facilitate discovery and payment — we are not a
          party to the individual service contract between a client and a designer.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old and capable of forming a binding contract to use Nidlo. By
          creating an account you represent that you meet these requirements.
        </p>

        <h2>3. Accounts</h2>
        <p>
          You are responsible for keeping your account credentials secure. Notify us immediately at{" "}
          <a href="mailto:support@nidlo.com">support@nidlo.com</a> if you suspect unauthorised access.
        </p>

        <h2>4. Orders and Payments</h2>
        <p>
          All prices are displayed in Ghana Cedis (GHS). Payments are processed via Moolre (MTN MoMo,
          Telecel Cash, AT) or Paystack. A platform service fee is deducted before the designer receives
          their payout. Refunds are subject to the designer&apos;s cancellation policy.
        </p>

        <h2>5. Designer Obligations</h2>
        <p>
          Designers are independent contractors, not employees of Nidlo. They are responsible for the
          quality of their work, accurate portfolio representation, and meeting agreed delivery timelines.
        </p>

        <h2>6. Prohibited Conduct</h2>
        <p>You may not use Nidlo to:</p>
        <ul>
          <li>Violate any applicable law or regulation</li>
          <li>Post false, misleading, or fraudulent content</li>
          <li>Harass, threaten, or intimidate other users</li>
          <li>Circumvent platform payments by transacting off-platform</li>
          <li>Scrape, crawl, or automate access to the platform without our written consent</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          Designers retain ownership of their original designs. By uploading content to Nidlo you grant
          us a non-exclusive, royalty-free licence to display that content on the platform.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Nidlo is not liable for indirect, incidental, or
          consequential damages arising from your use of the platform or any designer&apos;s services.
        </p>

        <h2>9. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of material changes via
          in-app notification or email. Continued use of the platform after the effective date constitutes
          acceptance.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions? Reach us at <a href="mailto:legal@nidlo.com">legal@nidlo.com</a> or via our{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </main>
  );
}
