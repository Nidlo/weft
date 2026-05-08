import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Nidlo Privacy Policy — how we collect, use, and protect your personal data.",
};

const EFFECTIVE_DATE = "1 May 2026";

const SECTIONS = [
  { id: "collect", title: "Information we collect" },
  { id: "use", title: "How we use your information" },
  { id: "ai", title: "Body measurements & AI processing" },
  { id: "share", title: "Sharing your information" },
  { id: "retention", title: "Data retention" },
  { id: "rights", title: "Your rights" },
  { id: "security", title: "Security" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
          Privacy
        </p>
        <h1 className="text-display mt-2 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground tabular-nums">
          Effective {EFFECTIVE_DATE}
        </p>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          This Privacy Policy explains how <strong>Nidlo</strong> collects,
          uses, and protects your personal information when you use our
          platform.
        </p>
      </header>

      <GlassCard variant="solid" className="mt-8 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          On this page
        </p>
        <ol className="mt-3 grid text-sm sm:grid-cols-2">
          {SECTIONS.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="group flex min-h-11 items-baseline gap-2 rounded-lg py-2.5 text-foreground/80 transition-colors hover:text-copper"
              >
                <span className="text-[11px] font-semibold tabular-nums text-copper">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </GlassCard>

      <ThreadDivider className="mt-10" />

      <article className="mt-10 space-y-12 text-sm leading-7 text-foreground/85 sm:text-base">
        <Section id="collect" index={1} title="Information we collect">
          <ul className="list-disc space-y-2 pl-6 marker:text-copper">
            <li>
              <strong className="text-foreground">Account data:</strong> name,
              phone number, email address, country
            </li>
            <li>
              <strong className="text-foreground">Profile data:</strong> photos,
              bio, portfolio images, body measurements (stored encrypted,
              retained for 30 days unless you save them)
            </li>
            <li>
              <strong className="text-foreground">Transaction data:</strong>{" "}
              order details, payment references (not card numbers — those are
              held by Moolre / Paystack)
            </li>
            <li>
              <strong className="text-foreground">Usage data:</strong> pages
              visited, search queries, device type (via analytics)
            </li>
          </ul>
        </Section>

        <Section id="use" index={2} title="How we use your information">
          <ul className="list-disc space-y-2 pl-6 marker:text-copper">
            <li>Provide, operate, and improve the platform</li>
            <li>Process payments and payouts</li>
            <li>Send order status updates, OTPs, and service notifications</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section id="ai" index={3} title="Body measurements & AI processing">
          <p>
            If you use our Fitscan body-scanning feature, photos are processed
            on our servers to extract measurements. Photos are deleted
            immediately after processing unless you explicitly save your
            measurements. Measurements are only shared with designers on orders
            you create.
          </p>
          <p className="mt-3">
            We use Anthropic Claude to validate measurement quality. Photos are
            only sent to Anthropic after you provide explicit consent (subject
            ID token). Anthropic&apos;s data handling is governed by their
            privacy policy.
          </p>
        </Section>

        <Section id="share" index={4} title="Sharing your information">
          <p>We share data with:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-copper">
            <li>
              <strong className="text-foreground">Designers</strong> — your
              name, measurements, and order details on commissions you place
            </li>
            <li>
              <strong className="text-foreground">Payment processors</strong> —
              Moolre, Paystack (as required for transactions)
            </li>
            <li>
              <strong className="text-foreground">Service providers</strong> —
              hosting (Contabo), media (ImageKit), SMS (Arkesel), email
              (Resend), error monitoring (Sentry)
            </li>
          </ul>
          <p className="mt-3">We do not sell your personal data.</p>
        </Section>

        <Section id="retention" index={5} title="Data retention">
          <p>
            We retain your account data while your account is active. Body scan
            photos are deleted within 30 days. You may request deletion of your
            account and all associated data at any time.
          </p>
        </Section>

        <Section id="rights" index={6} title="Your rights">
          <p>You have the right to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-copper">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>
              Request deletion of your data (&ldquo;right to be forgotten&rdquo;)
            </li>
            <li>Object to certain processing</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:privacy@nidlo.com"
              className="font-medium text-copper underline-offset-2 hover:underline"
            >
              privacy@nidlo.com
            </a>
            .
          </p>
        </Section>

        <Section id="security" index={7} title="Security">
          <p>
            We use industry-standard security measures including encrypted
            connections (TLS), encrypted storage, and access controls. No system
            is 100% secure — please use a strong, unique password for your
            account.
          </p>
        </Section>

        <Section id="changes" index={8} title="Changes">
          <p>
            We may update this policy. We will notify you of material changes
            via in-app notification. Continued use constitutes acceptance of the
            updated policy.
          </p>
        </Section>

        <Section id="contact" index={9} title="Contact">
          <p>
            Privacy questions:{" "}
            <a
              href="mailto:privacy@nidlo.com"
              className="font-medium text-copper underline-offset-2 hover:underline"
            >
              privacy@nidlo.com
            </a>{" "}
            or visit our{" "}
            <Link
              href="/contact"
              className="font-medium text-copper underline-offset-2 hover:underline"
            >
              contact page
            </Link>
            .
          </p>
        </Section>
      </article>
    </main>
  );
}

interface SectionProps {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}

function Section({ id, index, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper tabular-nums">
        {String(index).padStart(2, "0")}
      </p>
      <h2 className="text-display mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
