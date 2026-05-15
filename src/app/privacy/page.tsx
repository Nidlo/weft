import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";

const PRIVACY_DESCRIPTION =
  "How Nidlo collects, uses, retains and protects your personal data. Anchored in Ghana's Data Protection Act 2012 (Act 843) and designed to honour equivalent privacy rights wherever you use Nidlo.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "article",
    title: "Nidlo Privacy Policy",
    description: PRIVACY_DESCRIPTION,
    url: "/privacy",
    siteName: "Nidlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nidlo Privacy Policy",
    description: PRIVACY_DESCRIPTION,
  },
};

const EFFECTIVE_DATE = "13 May 2026";
const CONTACT_EMAIL = "snad.dev@gmail.com";
const CONTACT_PHONE_DISPLAY = "+233 20 576 8278";
const CONTACT_PHONE_LINK = "+233205768278";

const SECTIONS = [
  { id: "about", title: "About this policy" },
  { id: "controller", title: "Who we are" },
  { id: "collect", title: "Personal data we collect" },
  { id: "fitscan", title: "Body measurements & AI" },
  { id: "basis", title: "Lawful basis for processing" },
  { id: "use", title: "How we use your data" },
  { id: "share", title: "Sharing your data" },
  { id: "cookies", title: "Cookies & session tokens" },
  { id: "retention", title: "Data retention" },
  { id: "security", title: "Data security" },
  { id: "rights", title: "Your rights under Act 843" },
  { id: "transfers", title: "International transfers" },
  { id: "children", title: "Children's privacy" },
  { id: "breach", title: "Breach notification" },
  { id: "complaint", title: "Lodging a complaint" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <AppShell bare>
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Privacy
          </p>
          <h1 className="text-display mt-2 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-3 text-sm tabular-nums">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm sm:text-base">
            This Privacy Policy explains how <strong>Nidlo</strong> collects,
            uses, discloses, retains and protects your personal data. Nidlo is
            incorporated in the Republic of Ghana, so the policy is anchored in
            Ghana&apos;s{" "}
            <strong>Data Protection Act 2012 (Act&nbsp;843)</strong>. It is also
            designed to honour equivalent rights under other modern
            data-protection laws, including the European and United Kingdom
            data-protection regulations, California&apos;s consumer privacy laws
            and similar regimes, wherever you use the Platform.
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
          <Section id="about" index={1} title="About this policy">
            <p>
              Nidlo (&ldquo;<strong>Nidlo</strong>&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates a global marketplace
              that connects clients with custom-fashion designers, tailors and
              seamstresses. We launched in Ghana and are opening additional
              markets in phases. The Platform is built to serve users worldwide
              and is accessible from any country where it is lawful to use it.
              This Privacy Policy applies to every visitor, client and designer
              who uses our website, web app, mobile experiences and related
              services (together, the &ldquo;Platform&rdquo;).
            </p>
            <p className="mt-3">
              By creating a Nidlo account or otherwise using the Platform you
              confirm that you have read and understood this Privacy Policy.
              Please also read our{" "}
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
              </Link>{" "}
              and{" "}
              <Link
                href="/data-deletion"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Data Deletion
              </Link>{" "}
              page, which together govern your use of Nidlo.
            </p>
          </Section>

          <Section id="controller" index={2} title="Who we are">
            <p>
              Nidlo is the <strong>data controller</strong> responsible for the
              personal data processed through the Platform. During our private
              beta, the founder personally serves as Data Protection Officer.
            </p>
            <p className="mt-3">
              <strong>Data controller:</strong> Nidlo (incorporated in Ghana,
              serving users worldwide)
              <br />
              <strong>Data Protection Officer:</strong> Snad
              <br />
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <br />
              <strong>Phone:</strong>{" "}
              <a
                href={`tel:${CONTACT_PHONE_LINK}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_PHONE_DISPLAY}
              </a>
            </p>
          </Section>

          <Section id="collect" index={3} title="Personal data we collect">
            <p>
              We collect data you give us directly (for example when you sign
              up, complete onboarding or place an order) and data generated
              automatically when you interact with the Platform.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.1 Identity &amp; account data
            </h3>
            <DataTable
              rows={[
                [
                  "First name, last name, other names",
                  "Account identification",
                ],
                [
                  "Phone number (with country code)",
                  "Sign-in via one-time password (OTP)",
                ],
                [
                  "Email address",
                  "Account recovery, receipts, service notices",
                ],
                [
                  "Country (inferred from phone prefix)",
                  "Market eligibility, currency",
                ],
                ["Profile photograph", "Visual identification"],
                ["Date of account creation", "Account audit trail"],
              ]}
            />

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.2 Designer profile data
            </h3>
            <DataTable
              rows={[
                ["Display name & profile slug", "Public designer storefront"],
                [
                  "Bio, specializations, years of experience",
                  "Discovery & search filters",
                ],
                ["Portfolio images", "Showcasing past work"],
                [
                  "City, region, geolocation",
                  "Local discovery (selected via Google Maps)",
                ],
                [
                  "Verification documents (ID, business)",
                  "Designer onboarding & trust signals",
                ],
                [
                  "MoMo payout account details",
                  "Receiving payouts after orders complete",
                ],
                ["Platform-fee rate", "Calculating designer earnings"],
              ]}
            />

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.3 Client profile data
            </h3>
            <DataTable
              rows={[
                [
                  "Fashion interests (style, occasion, culture, fabric)",
                  "Personalised recommendations",
                ],
                ["Saved body measurements", "Pre-filling new orders"],
                ["Delivery addresses", "Order fulfilment"],
                ["Referral source", "Onboarding analytics"],
              ]}
            />

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.4 Body measurement &amp; Fitscan data{" "}
              <span className="text-copper text-xs">(sensitive)</span>
            </h3>
            <DataTable
              rows={[
                [
                  "Body measurements (chest, waist, hip, etc.)",
                  "Matching garments to your body",
                ],
                [
                  "Front and side scan photographs",
                  "AI-assisted measurement extraction",
                ],
                ["Height, weight (optional)", "Improving measurement accuracy"],
                ["Scan validation results", "Quality assurance"],
              ]}
            />
            <p className="mt-3 text-sm">
              See the dedicated{" "}
              <a
                href="#fitscan"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Body measurements &amp; AI
              </a>{" "}
              section below for how Fitscan handles this kind of sensitive
              input.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.5 Order &amp; payment data
            </h3>
            <DataTable
              rows={[
                [
                  "Order details, garment blueprint, status timeline",
                  "Marketplace coordination",
                ],
                [
                  "Payment-provider transaction reference",
                  "Reconciliation and receipts",
                ],
                [
                  "Payment method category (mobile money, card)",
                  "Routing and receipting only. We never see card numbers.",
                ],
                [
                  "Payout transaction reference",
                  "Designer earnings reconciliation",
                ],
                ["Marketplace-fee record", "Marketplace accounting"],
                ["Refund or dispute notes", "Dispute handling and reversals"],
              ]}
            />
            <p className="mt-3 text-sm">
              <strong>
                Nidlo does not hold, custody or move customer funds, and does
                not store full card numbers, security codes or banking
                credentials.
              </strong>{" "}
              Card and mobile-money information is held by the regulated
              payment-service provider that handles your payment. Each provider
              is licensed by the financial-services authority of its home
              jurisdiction and, where it processes card data, certified to
              internationally recognised card-security standards. Payments flow
              directly from your payment method to the designer&apos;s payout
              wallet; Nidlo never holds the money in between.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.6 Communications &amp; in-app activity
            </h3>
            <DataTable
              rows={[
                [
                  "Messages between you and other users",
                  "Order coordination & dispute resolution",
                ],
                [
                  "Reviews and ratings (after first orders ship)",
                  "Marketplace quality signals",
                ],
                [
                  "Notification preferences (push, SMS, email)",
                  "Honouring your channel choices",
                ],
                [
                  "Support tickets and correspondence",
                  "Resolving your queries",
                ],
              ]}
            />

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              3.7 Technical &amp; security data
            </h3>
            <DataTable
              rows={[
                [
                  "Secure sign-in token (server-side cookie)",
                  "Keeping you signed in across pages",
                ],
                [
                  "Security cookie that pairs with the sign-in token",
                  "Blocking impersonation and request-forgery attempts",
                ],
                [
                  "IP address, browser type, device type",
                  "Security, fraud prevention, anonymised analytics",
                ],
                [
                  "One-time passcodes (short-lived, one-way encrypted)",
                  "Verifying your phone number at sign-in",
                ],
                [
                  "Application-error event data (with personal data removed)",
                  "Detecting and fixing platform errors",
                ],
                [
                  "Anonymised product-usage events",
                  "Understanding aggregate usage patterns",
                ],
                [
                  "Push-notification token (when push is enabled)",
                  "Delivering in-app alerts you have opted in to",
                ],
              ]}
            />
          </Section>

          <Section
            id="fitscan"
            index={4}
            title="Body measurements & AI processing"
          >
            <p>
              Fitscan is Nidlo&apos;s in-house body-measurement service. It uses
              a computer-vision pipeline, supported (where enabled) by an
              external AI-model provider, to turn two photographs into a set of
              body measurements. Body imagery is among the most sensitive data
              we handle, so we apply stricter rules to it than to anything else
              we process.
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Explicit consent</strong> is required before you upload
                any scan photograph.
              </li>
              <li>
                <strong>Photographs are encrypted at rest</strong> and
                accessible only to the Fitscan service and to you.
              </li>
              <li>
                <strong>Photographs are deleted within 30 days</strong> of
                upload, unless you explicitly choose to keep them attached to a
                saved scan. Even then you can delete them at any time.
              </li>
              <li>
                <strong>Designers never see your scan photographs.</strong> Only
                the resulting numeric measurements are shared, and only with
                designers on orders you have placed.
              </li>
              <li>
                When external AI validation is enabled, the photographs and a
                short-lived measurement payload are sent over an encrypted
                connection to an external AI-model provider that we contract
                with under a written data-processing agreement. That agreement
                prohibits the provider from using your data to train its
                general-purpose models.
              </li>
              <li>
                You can request immediate deletion of all Fitscan data through
                our{" "}
                <Link
                  href="/data-deletion"
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  Data Deletion
                </Link>{" "}
                page.
              </li>
            </ul>
          </Section>

          <Section id="basis" index={5} title="Lawful basis for processing">
            <p>
              Section&nbsp;20 of Ghana&apos;s Data Protection Act 2012
              (Act&nbsp;843) requires us to identify a lawful basis for every
              category of processing. The same six lawful bases appear, in
              nearly identical language, in the European and United Kingdom
              data-protection regulations and most modern data-protection
              statutes. We rely on the following:
            </p>
            <DataTable
              head={["Lawful basis (Act 843)", "When we rely on it"]}
              rows={[
                [
                  "Consent (s.20(2)(a))",
                  "Body scans, marketing communications, optional cookies",
                ],
                [
                  "Performance of a contract (s.20(2)(b))",
                  "Creating your account, processing orders, settling payments to designers",
                ],
                [
                  "Legal obligation (s.20(2)(c))",
                  "Tax records, anti-money-laundering reporting, fraud investigations",
                ],
                [
                  "Legitimate interest (s.20(2)(d))",
                  "Fraud prevention, platform security, aggregate product analytics",
                ],
                [
                  "Public interest (s.20(2)(e))",
                  "Cooperating with lawful requests from authorities",
                ],
              ]}
            />
            <p className="mt-3">
              You may withdraw consent at any time. Withdrawing consent does not
              affect the lawfulness of processing carried out before the
              withdrawal.
            </p>
          </Section>

          <Section id="use" index={6} title="How we use your data">
            <ul className="marker:text-copper list-disc space-y-2 pl-6">
              <li>Create and secure your Nidlo account</li>
              <li>Match clients with suitable designers</li>
              <li>Process payments and instant payouts</li>
              <li>Generate body measurements through Fitscan</li>
              <li>
                Deliver order status updates, OTPs and service notifications
              </li>
              <li>Provide in-app and email customer support</li>
              <li>Detect and prevent fraud, abuse and security incidents</li>
              <li>
                Comply with applicable law and respond to lawful requests from
                competent authorities in any country where we operate
              </li>
              <li>Measure aggregate product usage to improve the Platform</li>
            </ul>
            <p className="mt-3">
              <strong>We do not sell your personal data.</strong> We do not
              carry out automated decisions that produce legal effects
              concerning you, and we do not engage in profiling for advertising.
            </p>
          </Section>

          <Section id="share" index={7} title="Sharing your data">
            <p>
              We only share personal data with the parties listed below, and
              only to the extent strictly necessary for the stated purpose. Each
              partner is contractually bound to keep your data confidential and
              secure.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              7.1 Designers and clients on your orders
            </h3>
            <p>
              When you place an order, we share your name, delivery details,
              order requirements and (where you choose) your body measurements
              with the designer fulfilling the order. Designers may not use this
              information for anything other than completing your order.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              7.2 Categories of service provider
            </h3>
            <p>
              Each provider is bound to us by a written agreement that limits
              how it may use your data, requires appropriate security, and
              prohibits onward sale.
            </p>
            <DataTable
              head={["Category", "Purpose", "Data shared"]}
              rows={[
                [
                  "Regulated payment-service providers",
                  "Processing card and mobile-money payments, and settling funds to designers",
                  "Amount, transaction reference, name, contact details, payment method category",
                ],
                [
                  "SMS gateway providers",
                  "Sending one-time passcodes and order alerts to your phone",
                  "Phone number, message content",
                ],
                [
                  "Transactional email providers",
                  "Sending receipts, account messages and order updates",
                  "Email address, message content",
                ],
                [
                  "Image-storage and image-delivery providers",
                  "Hosting and serving uploaded media",
                  "Uploaded images with embedded metadata removed before storage",
                ],
                [
                  "Encrypted file-storage providers",
                  "Long-term, encrypted storage of uploaded files",
                  "Uploaded files",
                ],
                [
                  "Mapping and geocoding providers",
                  "Address autocomplete and approximate geolocation",
                  "Address input you have entered",
                ],
                [
                  "External AI-model provider",
                  "Validation of Fitscan body-measurement outputs (when enabled)",
                  "Scan photographs and measurement payload",
                ],
                [
                  "Push-messaging provider",
                  "Delivering opt-in push notifications",
                  "Push-notification token and message payload",
                ],
                [
                  "Application-error monitoring provider",
                  "Detecting and diagnosing platform errors",
                  "Diagnostic event data with personal information removed",
                ],
                [
                  "Aggregate-analytics provider(s)",
                  "Understanding anonymised product usage",
                  "Anonymised events and device class",
                ],
                [
                  "Cloud infrastructure providers",
                  "Hosting the Platform and delivering content globally",
                  "Encrypted data at rest, transient request metadata",
                ],
              ]}
            />

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              7.3 Legal and regulatory disclosures
            </h3>
            <p>
              We will disclose personal data to courts, regulators, law
              enforcement or other public authorities where we are required to
              do so by applicable law, lawful court order, or to defend our
              rights and the safety of our users.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              7.4 Business transfers
            </h3>
            <p>
              If Nidlo is restructured, merged with or acquired by another
              entity, your data may transfer to the successor under
              substantially the same protections set out here. We will notify
              you of any material change.
            </p>

            <p className="mt-4">
              <strong>We do not sell, rent or trade personal data.</strong>
            </p>
          </Section>

          <Section id="cookies" index={8} title="Cookies & session tokens">
            <p>
              Nidlo uses a small set of cookies and similar storage for signing
              you in, securing your session, anonymised analytics and (in
              future) push notifications. Your sign-in token is held in a
              secure, server-side cookie that browser scripts cannot read, never
              in the kind of browser storage that other scripts on the page
              could see. Full details, including how to manage or block these
              technologies, are in our{" "}
              <Link
                href="/cookies"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Cookie &amp; Session Policy
              </Link>
              .
            </p>
          </Section>

          <Section id="retention" index={9} title="Data retention">
            <p>
              We keep personal data only as long as we need it for the purpose
              we collected it, or as required by law.
            </p>
            <DataTable
              head={["Data category", "Retention period"]}
              rows={[
                [
                  "Account and profile data",
                  "While your account is active, plus a soft-delete window of 30 days during which you can restore it, then up to 6 years for audit and tax records",
                ],
                [
                  "Body scan photographs",
                  "Up to 30 days from upload, or until you save or delete the scan",
                ],
                [
                  "Body measurements",
                  "While your account is active, or until you delete them",
                ],
                [
                  "Order and payment records",
                  "Up to 6 years, to meet tax and anti-money-laundering record-keeping obligations in the countries where we operate",
                ],
                [
                  "Messages and support tickets",
                  "While your account is active, plus 2 years",
                ],
                [
                  "Sign-in session cookies",
                  "Cleared on sign-out or after session expiry",
                ],
                [
                  "One-time passcodes",
                  "Held in one-way encrypted form and discarded after a few minutes",
                ],
                ["Application-error event data", "30 days"],
                ["Aggregate analytics events", "Up to 26 months"],
              ]}
            />
            <p className="mt-3">
              When a retention period expires, the data is securely deleted or
              anonymised so that you can no longer be identified.
            </p>
          </Section>

          <Section id="security" index={10} title="Data security">
            <p>
              We follow internationally recognised information-security
              practices, and we choose vendors that do the same. No online
              service can promise absolute security, but our day-to-day controls
              include:
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>
                Encrypted connections for all traffic between your device and
                Nidlo.
              </li>
              <li>
                Secure, server-side sign-in tokens that other browser scripts
                cannot read.
              </li>
              <li>
                Built-in protection against impersonation and request-forgery
                attacks.
              </li>
              <li>
                Limits on how often the sign-in and one-time-passcode endpoints
                can be tried.
              </li>
              <li>
                One-way encryption of passcodes and passwords so they cannot be
                reversed even by us.
              </li>
              <li>
                Encrypted storage of uploaded media and Fitscan photographs.
              </li>
              <li>
                Automatic removal of embedded metadata (including any GPS
                location) from every uploaded image before it is stored.
              </li>
              <li>Role-based access on internal tools, with audit trails.</li>
              <li>
                Continuous logging, anomaly detection and error monitoring.
              </li>
              <li>
                Annual review of every supplier that processes personal data on
                our behalf.
              </li>
            </ul>
          </Section>

          <Section id="rights" index={11} title="Your data rights">
            <p>
              Ghana&apos;s Data Protection Act 2012 (Act&nbsp;843) gives every
              data subject the rights listed below. Equivalent rights exist
              under the European and United Kingdom data-protection regulations,
              California&apos;s consumer privacy laws and many other regimes;
              wherever you are based, you have at least the rights set out here.
              You can exercise any of them by contacting us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond within <strong>30 days</strong> and never charge
              a fee for a legitimate request.
            </p>
            <DataTable
              head={["Right", "How to exercise it"]}
              rows={[
                [
                  "Access. Receive a copy of the data we hold about you (s.35)",
                  "Email us; we will send an export",
                ],
                [
                  "Rectification. Correct inaccurate or incomplete data (s.33)",
                  "Use Settings, or email us",
                ],
                [
                  "Erasure. Delete your data (s.33)",
                  "Use our Data Deletion page",
                ],
                [
                  "Restriction. Pause processing while we investigate a dispute (s.34)",
                  "Email us",
                ],
                [
                  "Object to processing based on legitimate interest (s.38)",
                  "Email us",
                ],
                [
                  "Withdraw consent for any processing based on consent (s.23)",
                  "Email us, or use in-app settings",
                ],
                [
                  "Portability. Receive your data in a structured, machine-readable format",
                  "Email us",
                ],
                [
                  "Not be subject to automated decisions with legal effect (s.39)",
                  "We do not currently take automated decisions of this kind",
                ],
                [
                  "Lodge a complaint with a data-protection regulator",
                  "See the next section",
                ],
              ]}
            />
            <p className="mt-3">
              We may ask you to verify your identity before acting on a request,
              so that we never disclose your data to someone impersonating you.
              See{" "}
              <Link
                href="/data-deletion"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Data Deletion
              </Link>{" "}
              for the verification process that applies to deletion requests.
            </p>
          </Section>

          <Section id="transfers" index={12} title="International transfers">
            <p>
              Nidlo is a global service, so some of our suppliers and cloud
              providers process data outside the country where you live. Where
              we transfer personal data across borders, we rely on one or more
              of the following safeguards, in line with sections 18 and 47 of
              Act&nbsp;843 and equivalent international rules:
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>
                Suppliers that publicly commit to a comparable level of data
                protection, backed by recognised cross-border transfer
                mechanisms (such as standard contractual clauses).
              </li>
              <li>
                Encryption of data both while it is moving across the network
                and while it is stored.
              </li>
              <li>
                Contractual terms that forbid onward sale or any unauthorised
                use of your data.
              </li>
              <li>
                Your explicit consent, where required for sensitive transfers
                (for example, sending Fitscan photographs for external AI
                validation).
              </li>
            </ul>
          </Section>

          <Section id="children" index={13} title="Children's privacy">
            <p>
              Nidlo is intended for adults aged <strong>18 and over</strong>. We
              do not knowingly collect personal data from anyone under 18. If
              you believe we have inadvertently collected data from a minor,
              please email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              and we will delete it promptly.
            </p>
          </Section>

          <Section id="breach" index={14} title="Breach notification">
            <p>
              If a personal data breach is likely to put your rights at risk, we
              will:
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                Notify affected users <strong>within 72 hours</strong> of
                becoming aware of the breach, where feasible.
              </li>
              <li>
                Notify the <strong>Data Protection Commission</strong> of Ghana
                under section 31 of Act&nbsp;843, and (where you are based
                outside Ghana) the competent supervisory authority in your
                country where applicable law requires it.
              </li>
              <li>
                Describe the nature of the breach, the categories of data
                affected, the likely consequences and the steps we have taken to
                limit the harm.
              </li>
              <li>
                Cooperate fully with any investigation by a competent authority.
              </li>
            </ol>
          </Section>

          <Section id="complaint" index={15} title="Lodging a complaint">
            <p>
              We hope you will give us the chance to resolve any concerns
              directly. If you are not satisfied with our response, you can
              lodge a complaint with a data-protection regulator. Because Nidlo
              is incorporated in Ghana, the lead regulator for our global
              operations is Ghana&apos;s{" "}
              <strong>Data Protection Commission</strong> (DPC). If you are
              based outside Ghana, you may also (or instead) lodge your
              complaint with the supervisory authority responsible for data
              protection in your country of residence or place of work.
            </p>
            <p className="mt-3">
              <strong>Data Protection Commission, Ghana</strong>
              <br />
              2nd Floor, GP-GPS: GA-052-2748, off the Cantonments Road, Accra
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

          <Section id="changes" index={16} title="Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will update the &ldquo;Effective&rdquo; date above and, for
              material changes, notify you in-app or by email before the new
              version takes effect. Continued use of Nidlo after the effective
              date constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section id="contact" index={17} title="Contact us">
            <p>
              For any privacy question, request or complaint, please reach out:
            </p>
            <p className="mt-3">
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
            </p>
          </Section>
        </article>

        <ThreadDivider className="mt-12" />
        <p className="text-muted-foreground mt-6 text-xs italic">
          Nidlo is incorporated in the Republic of Ghana. This Privacy Policy is
          anchored in Ghana&apos;s Data Protection Act&nbsp;2012 (Act&nbsp;843)
          and is designed to honour equivalent privacy rights under other modern
          data-protection laws wherever you use the Platform.
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
  const headers = head ?? ["Data", "Purpose"];
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
