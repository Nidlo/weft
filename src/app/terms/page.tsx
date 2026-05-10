import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Nidlo Terms of Service — the rules that govern your use of the platform.",
};

const EFFECTIVE_DATE = "1 May 2026";

const SECTIONS = [
  { id: "platform", title: "The platform" },
  { id: "eligibility", title: "Eligibility" },
  { id: "accounts", title: "Accounts" },
  { id: "orders", title: "Orders & payments" },
  { id: "designers", title: "Designer obligations" },
  { id: "prohibited", title: "Prohibited conduct" },
  { id: "ip", title: "Intellectual property" },
  { id: "liability", title: "Limitation of liability" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <header>
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          Legal
        </p>
        <h1 className="text-display mt-2 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mt-3 text-sm tabular-nums">
          Effective {EFFECTIVE_DATE}
        </p>
        <p className="text-muted-foreground mt-4 max-w-xl text-sm sm:text-base">
          Welcome to <strong>Nidlo</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
          or &ldquo;our&rdquo;). By accessing or using our platform you agree to
          these Terms of Service. Please read them carefully.
        </p>
      </header>

      <GlassCard variant="solid" className="mt-8 p-5">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          On this page
        </p>
        <ol className="mt-3 grid text-sm sm:grid-cols-2">
          {SECTIONS.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="group text-foreground/80 hover:text-copper flex min-h-11 items-baseline gap-2 rounded-lg py-2.5 transition-colors"
              >
                <span className="text-copper text-[11px] font-semibold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </GlassCard>

      <ThreadDivider className="mt-10" />

      <article className="text-foreground/85 mt-10 space-y-12 text-sm leading-7 sm:text-base">
        <Section id="platform" index={1} title="The platform">
          <p>
            Nidlo is a marketplace that connects clients with independent
            fashion designers, tailors, and seamstresses across Ghana and West
            Africa. We facilitate discovery and payment — we are not a party to
            the individual service contract between a client and a designer.
          </p>
        </Section>

        <Section id="eligibility" index={2} title="Eligibility">
          <p>
            You must be at least 18 years old and capable of forming a binding
            contract to use Nidlo. By creating an account you represent that you
            meet these requirements.
          </p>
        </Section>

        <Section id="accounts" index={3} title="Accounts">
          <p>
            You are responsible for keeping your account credentials secure.
            Notify us immediately at{" "}
            <a
              href="mailto:support@nidlo.com"
              className="text-copper font-medium underline-offset-2 hover:underline"
            >
              support@nidlo.com
            </a>{" "}
            if you suspect unauthorised access.
          </p>
        </Section>

        <Section id="orders" index={4} title="Orders & payments">
          <p>
            All prices are displayed in Ghana Cedis (GHS). Payments are
            processed securely through our payment partners and accept MTN MoMo,
            Telecel Cash, AT, and major card networks. A platform service fee is
            deducted before the designer receives their payout. Refunds are
            subject to the designer&apos;s cancellation policy. The full list of
            payment partners we work with is in our privacy policy.
          </p>
        </Section>

        <Section id="designers" index={5} title="Designer obligations">
          <p>
            Designers are independent contractors, not employees of Nidlo. They
            are responsible for the quality of their work, accurate portfolio
            representation, and meeting agreed delivery timelines.
          </p>
        </Section>

        <Section id="prohibited" index={6} title="Prohibited conduct">
          <p>You may not use Nidlo to:</p>
          <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
            <li>Violate any applicable law or regulation</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, threaten, or intimidate other users</li>
            <li>Circumvent platform payments by transacting off-platform</li>
            <li>
              Scrape, crawl, or automate access to the platform without our
              written consent
            </li>
          </ul>
        </Section>

        <Section id="ip" index={7} title="Intellectual property">
          <p>
            Designers retain ownership of their original designs. By uploading
            content to Nidlo you grant us a non-exclusive, royalty-free licence
            to display that content on the platform.
          </p>
        </Section>

        <Section id="liability" index={8} title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, Nidlo is not liable for
            indirect, incidental, or consequential damages arising from your use
            of the platform or any designer&apos;s services.
          </p>
        </Section>

        <Section id="changes" index={9} title="Changes to these terms">
          <p>
            We may update these Terms from time to time. We will notify you of
            material changes via in-app notification or email. Continued use of
            the platform after the effective date constitutes acceptance.
          </p>
        </Section>

        <Section id="contact" index={10} title="Contact">
          <p>
            Questions? Reach us at{" "}
            <a
              href="mailto:legal@nidlo.com"
              className="text-copper font-medium underline-offset-2 hover:underline"
            >
              legal@nidlo.com
            </a>{" "}
            or via our{" "}
            <Link
              href="/contact"
              className="text-copper font-medium underline-offset-2 hover:underline"
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
      <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase tabular-nums">
        {String(index).padStart(2, "0")}
      </p>
      <h2 className="text-display mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
