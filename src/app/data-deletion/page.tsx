import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";

const DATA_DELETION_DESCRIPTION =
  "How to delete your Nidlo data and account. Your right to erasure, the 30-day soft-delete window during which you can restore your account, what gets deleted, what we must keep, and how to submit a request.";

export const metadata: Metadata = {
  title: "Data Deletion",
  description: DATA_DELETION_DESCRIPTION,
  alternates: {
    canonical: "/data-deletion",
  },
  openGraph: {
    type: "article",
    title: "Delete or restore your Nidlo account",
    description: DATA_DELETION_DESCRIPTION,
    url: "/data-deletion",
    siteName: "Nidlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delete or restore your Nidlo account",
    description: DATA_DELETION_DESCRIPTION,
  },
};

const EFFECTIVE_DATE = "13 May 2026";
const CONTACT_EMAIL = "snad.dev@gmail.com";
const CONTACT_PHONE_DISPLAY = "+233 20 576 8278";
const CONTACT_PHONE_LINK = "+233205768278";

const SECTIONS = [
  { id: "right", title: "Your right to deletion" },
  { id: "soft-delete", title: "The 30-day soft-delete window" },
  { id: "scope", title: "What gets deleted" },
  { id: "retained", title: "What we must retain" },
  { id: "fitscan", title: "Body scan photographs" },
  { id: "request", title: "How to request deletion" },
  { id: "restore", title: "Restoring your account" },
  { id: "verify", title: "Verifying it is really you" },
  { id: "timeline", title: "Response timeline" },
  { id: "after", title: "After permanent deletion" },
  { id: "appeal", title: "If we refuse a request" },
  { id: "contact", title: "Contact" },
];

export default function DataDeletionPage() {
  return (
    <AppShell bare>
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Your data
          </p>
          <h1 className="text-display mt-2 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Data Deletion
          </h1>
          <p className="text-muted-foreground mt-3 text-sm tabular-nums">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm sm:text-base">
            You can ask <strong>Nidlo</strong> to delete your account and the
            personal data we hold about you. This page explains exactly what
            happens, the 30-day window during which you can change your mind,
            what we are legally allowed to keep, and how to submit a request. It
            is anchored in Ghana&apos;s Data Protection Act&nbsp;2012
            (Act&nbsp;843) and is designed to honour the right of erasure that
            appears in most modern data-protection laws.
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

        <GlassCard variant="ghost" className="border-copper/40 mt-6 p-5">
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Quick request
          </p>
          <p className="mt-2 text-sm sm:text-base">
            The simplest way to delete your account is from inside the app, at{" "}
            <em>Settings &rsaquo; Privacy &rsaquo; Delete my account</em>. You
            can also email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Data%20deletion%20request`}
              className="text-copper font-semibold underline-offset-2 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject &ldquo;
            <strong>Data deletion request</strong>&rdquo; from the email address
            linked to your account, or message{" "}
            <a
              href={`tel:${CONTACT_PHONE_LINK}`}
              className="text-copper font-semibold underline-offset-2 hover:underline"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>{" "}
            on WhatsApp from your registered phone number. Once a deletion is
            started, your account enters a 30-day soft-delete window. If you
            sign back in within those 30 days the account is fully restored;
            after the window closes the data is permanently and irreversibly
            removed.
          </p>
        </GlassCard>

        <ThreadDivider className="mt-10" />

        <article className="text-foreground/85 mt-10 space-y-12 text-sm leading-7 sm:text-base">
          <Section id="right" index={1} title="Your right to deletion">
            <p>
              Section&nbsp;33 of Ghana&apos;s Data Protection Act&nbsp;2012
              (Act&nbsp;843) gives every data subject the right to ask the data
              controller to delete personal data that:
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>Is no longer needed for the purpose it was collected.</li>
              <li>You consented to and have now withdrawn consent for.</li>
              <li>Has been processed unlawfully.</li>
              <li>
                You object to being processed on the basis of legitimate
                interest.
              </li>
            </ul>
            <p className="mt-3">
              Equivalent rights exist under the European and United Kingdom
              data-protection regulations, California&apos;s consumer privacy
              laws and many other regimes. Wherever you are based, you have at
              least the right of erasure described on this page.
            </p>
            <p className="mt-3">
              You also have the related right to ask us to{" "}
              <strong>correct</strong> inaccurate or incomplete data. If you
              want correction rather than deletion, please say so in your
              request. Sometimes that is the better outcome and saves you from
              losing your order history or designer relationship.
            </p>
          </Section>

          <Section
            id="soft-delete"
            index={2}
            title="The 30-day soft-delete window"
          >
            <p>
              We know that deciding to delete an account can be a
              spur-of-the-moment thing, and that sometimes you change your mind.
              To give you a safety net, every deletion request goes through a{" "}
              <strong>30-day soft-delete window</strong> before any data is
              permanently removed.
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                <strong>Day 0.</strong> You confirm the deletion. Your account
                is immediately deactivated. You are signed out on every device,
                your profile disappears from search, designer listings and
                notifications, and nobody else on Nidlo can find you.
              </li>
              <li>
                <strong>Days 1 to 30.</strong> Your data is held in a
                restricted, locked state. Nothing about you is shown to anyone,
                and we do not use the data for anything other than keeping the
                restore option open and meeting the legal record-keeping
                obligations described below.
              </li>
              <li>
                <strong>Restore.</strong> Sign back in at any point during the
                30 days using your registered phone number, and your account is
                brought back to life exactly as you left it. Order history,
                saved measurements, designer profile and messages all return.
              </li>
              <li>
                <strong>Day&nbsp;30.</strong> If you have not signed back in,
                the account is{" "}
                <strong>permanently and irreversibly deleted</strong>. From that
                moment we can no longer recover any of your data, and a new
                sign-up with the same phone number starts a fresh, empty
                account.
              </li>
            </ol>
            <p className="mt-3">
              You can also ask us to skip the 30-day window and delete your
              account immediately. We will do so once we have verified your
              identity, but please be sure: once we accept an immediate deletion
              there is no restore.
            </p>
          </Section>

          <Section id="scope" index={3} title="What gets deleted">
            <p>
              At the end of the 30-day soft-delete window (or sooner, if you ask
              for immediate deletion), we permanently remove the following:
            </p>
            <DataTable
              head={["Data", "Outcome"]}
              rows={[
                [
                  "Identity and profile (name, phone, email, photo)",
                  "Permanently deleted",
                ],
                [
                  "Designer profile, slug, bio, portfolio images",
                  "Permanently deleted",
                ],
                [
                  "Saved fashion interests and preferences",
                  "Permanently deleted",
                ],
                ["Saved body measurements", "Permanently deleted"],
                [
                  "Fitscan photographs (any still on file)",
                  "Permanently deleted",
                ],
                [
                  "Messages you have sent and received",
                  "Anonymised in the other party's transcript; your account is removed",
                ],
                [
                  "Reviews you have written",
                  "Anonymised (shown as 'Deleted user') so designer ratings stay accurate",
                ],
                ["Push-notification token", "Removed from our records"],
                [
                  "Sign-in sessions and cookies",
                  "Revoked immediately on the day you start the deletion",
                ],
                ["Analytics identifiers", "Disassociated from your account"],
              ]}
            />
          </Section>

          <Section id="retained" index={4} title="What we must retain">
            <p>
              Tax, anti-money-laundering and fraud-prevention laws require us to
              keep certain records even after you ask to be forgotten. The duty
              arises under Ghanaian law (because Nidlo is incorporated in Ghana)
              and, where you live elsewhere, under the equivalent tax and AML
              rules of your country of residence. Retained records are placed in
              restricted, audited storage and used only for the legal purpose
              that requires them.
            </p>
            <DataTable
              head={["Data", "Why we keep it", "Retention"]}
              rows={[
                [
                  "Order and payment records",
                  "Tax record-keeping (Income Tax Act 2015, Act 896, and equivalent tax rules in other countries) and AML record-keeping (Anti-Money Laundering Act 2020, Act 1044, and equivalent rules elsewhere)",
                  "Up to 6 years from the transaction date",
                ],
                [
                  "Tax invoices and marketplace-fee records",
                  "Tax-authority obligations in the countries where Nidlo operates",
                  "Up to 6 years",
                ],
                [
                  "Fraud, abuse and security-incident logs",
                  "Defending against legal claims and preventing repeat fraud",
                  "Up to 6 years",
                ],
                [
                  "Information subject to a lawful order",
                  "Court order or supervisory-authority investigation",
                  "As required by the order",
                ],
              ]}
            />
          </Section>

          <Section
            id="fitscan"
            index={5}
            title="Body scan photographs (Fitscan)"
          >
            <p>
              Body scan photographs are the most sensitive data Nidlo processes,
              and we apply two additional safeguards:
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                <strong>Automatic deletion:</strong> Fitscan photographs are
                automatically deleted within <strong>30 days</strong> of upload
                unless you explicitly choose to keep them linked to a saved
                scan.
              </li>
              <li>
                <strong>Immediate deletion on request:</strong> You can ask us
                to delete every photograph (and the linked measurement record)
                immediately, without waiting for the 30-day window. The deletion
                request can apply to a single scan or to every scan tied to your
                account.
              </li>
            </ol>
            <p className="mt-3">
              See the{" "}
              <Link
                href="/privacy#fitscan"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Body measurements &amp; AI section
              </Link>{" "}
              of our Privacy Policy for the full Fitscan data flow.
            </p>
          </Section>

          <Section id="request" index={6} title="How to request deletion">
            <p>You can submit a deletion request in three ways:</p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-3 pl-6">
              <li>
                <strong>In-app.</strong> Sign in and open{" "}
                <em>Settings &rsaquo; Privacy &rsaquo; Delete my account</em>.
                This is the fastest route and starts the 30-day soft-delete
                window straight away.
              </li>
              <li>
                <strong>Email.</strong> Send a message from the email address
                linked to your account to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Data%20deletion%20request`}
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                with the subject &ldquo;
                <strong>Data deletion request</strong>&rdquo;. Include the phone
                number associated with your account and tell us whether you want
                to delete (a) just your Fitscan data, (b) your full account with
                the 30-day soft-delete window, or (c) your full account
                immediately, with no restore option.
              </li>
              <li>
                <strong>WhatsApp.</strong> Message{" "}
                <a
                  href={`tel:${CONTACT_PHONE_LINK}`}
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>{" "}
                from the phone number on your Nidlo account.
              </li>
            </ol>
          </Section>

          <Section id="restore" index={7} title="Restoring your account">
            <p>
              If you change your mind during the 30-day soft-delete window you
              can restore your account at any time.
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                Open Nidlo and start the normal sign-in flow with the phone
                number that owns the deactivated account.
              </li>
              <li>
                Enter the one-time passcode we send you. We will let you know
                the account is in its soft-delete window and ask whether you
                would like to restore it.
              </li>
              <li>
                Confirm. Your profile, order history, saved measurements,
                designer listing (if any) and messages are reinstated exactly as
                they were on the day of deletion.
              </li>
            </ol>
            <p className="mt-3">
              If you sign in within the 30-day window without going through the
              restore prompt (for example because you tried to place a new
              order), we will still flag the soft-delete status to you and offer
              to restore the original account rather than create a new, empty
              one.
            </p>
          </Section>

          <Section id="verify" index={8} title="Verifying it is really you">
            <p>
              Because deletion is irreversible, we verify your identity before
              we act. We will:
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                Confirm the request came from a contact channel (phone or email)
                already linked to your account; and
              </li>
              <li>
                Send a one-time confirmation code to your registered phone
                number, which you reply with to authorise the deletion.
              </li>
            </ol>
            <p className="mt-3">
              If you have lost access to both your phone number and email, we
              will ask for additional information to confirm your identity
              before we proceed. We may decline a request that we cannot verify,
              to protect you against impersonation.
            </p>
          </Section>

          <Section id="timeline" index={9} title="Response timeline">
            <p>
              Most modern data-protection regimes, including Act&nbsp;843,
              require us to respond within a reasonable timeframe. Our targets:
            </p>
            <DataTable
              head={["Step", "Target"]}
              rows={[
                ["Acknowledgement of your request", "Within 3 working days"],
                ["Identity verification completed", "Within 7 working days"],
                [
                  "Soft-delete window begins",
                  "On the same day verification is completed",
                ],
                [
                  "Permanent deletion of recoverable data",
                  "30 days after verification, unless you have already restored the account or asked for immediate deletion",
                ],
                [
                  "Removal from encrypted backups",
                  "Up to 90 days after permanent deletion, as backups roll off on a fixed schedule",
                ],
              ]}
            />
            <p className="mt-3">
              If the request is complex, for example because it covers multiple
              order histories or pending disputes, we may extend the timeline by
              up to a further 60 days. We will tell you why and when to expect
              completion.
            </p>
          </Section>

          <Section id="after" index={10} title="After permanent deletion">
            <ul className="marker:text-copper list-disc space-y-2 pl-6">
              <li>You will not be able to sign back into your account.</li>
              <li>
                Your designer profile (if any) will be removed from search and
                discovery.
              </li>
              <li>
                In-flight orders that have not been delivered or refunded will
                be handled with the counter-party before deletion completes, to
                protect both sides.
              </li>
              <li>
                You may create a new Nidlo account in future using the same
                phone number; it will start completely empty.
              </li>
              <li>
                Anonymised records that no longer identify you (for example,
                aggregate marketplace statistics) may continue to be used for
                service operation and analytics.
              </li>
            </ul>
          </Section>

          <Section id="appeal" index={11} title="If we refuse a request">
            <p>
              In rare cases we may refuse a deletion request, for example where
              retention is required by law or where the request is clearly
              unfounded or excessive. If we refuse, we will tell you why, what
              data is affected and how you can appeal.
            </p>
            <p className="mt-3">
              You always have the right to lodge a complaint with a
              data-protection regulator. Because Nidlo is incorporated in Ghana,
              the lead regulator for our global operations is Ghana&apos;s{" "}
              <strong>Data Protection Commission</strong>. If you are based
              outside Ghana, you may also (or instead) lodge your complaint with
              the supervisory authority responsible for data protection in your
              country of residence.
            </p>
            <p className="mt-3">
              <strong>Data Protection Commission, Ghana</strong>
              <br />
              Website:{" "}
              <a
                href="https://www.dataprotection.org.gh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                dataprotection.org.gh
              </a>
              <br />
              Email:{" "}
              <a
                href="mailto:info@dataprotection.org.gh"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                info@dataprotection.org.gh
              </a>
            </p>
          </Section>

          <Section id="contact" index={12} title="Contact">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <br />
              <strong>Phone / WhatsApp:</strong>{" "}
              <a
                href={`tel:${CONTACT_PHONE_LINK}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_PHONE_DISPLAY}
              </a>
              <br />
              <strong>Contact page:</strong>{" "}
              <Link
                href="/contact"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                /contact
              </Link>
              <br />
              <strong>Related:</strong>{" "}
              <Link
                href="/privacy"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              ,{" "}
              <Link
                href="/terms"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Terms of Service
              </Link>
              ,{" "}
              <Link
                href="/cookies"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Cookie &amp; Session Policy
              </Link>
            </p>
          </Section>
        </article>

        <ThreadDivider className="mt-12" />
        <p className="text-muted-foreground mt-6 text-xs italic">
          Nidlo is incorporated in the Republic of Ghana. This page is anchored
          in Ghana&apos;s Data Protection Act&nbsp;2012 (Act&nbsp;843) and is
          designed to honour the right of erasure recognised by other modern
          data-protection laws. Where the law in your country requires more than
          the timelines above, the legal requirement applies.
        </p>
      </div>
    </AppShell>
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

interface DataTableProps {
  head?: string[];
  rows: string[][];
}

function DataTable({ head, rows }: DataTableProps) {
  const headers = head ?? ["Item", "Outcome"];
  return (
    <div className="border-border/60 mt-3 overflow-hidden rounded-xl border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-foreground/80 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-border/40 even:bg-muted/20 border-t">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="text-foreground/85 px-4 py-2.5 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
