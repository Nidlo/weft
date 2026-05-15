import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";

const TERMS_DESCRIPTION =
  "The agreement between you and Nidlo. Nidlo is incorporated in Ghana and available worldwide; these Terms cover eligibility, orders and payments, designer obligations, governing law, and the consumer protections that apply in your own country.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: TERMS_DESCRIPTION,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    type: "article",
    title: "Nidlo Terms of Service",
    description: TERMS_DESCRIPTION,
    url: "/terms",
    siteName: "Nidlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nidlo Terms of Service",
    description: TERMS_DESCRIPTION,
  },
};

const EFFECTIVE_DATE = "13 May 2026";
const CONTACT_EMAIL = "snad.dev@gmail.com";
const CONTACT_PHONE_DISPLAY = "+233 20 576 8278";
const CONTACT_PHONE_LINK = "+233205768278";

const SECTIONS = [
  { id: "acceptance", title: "Acceptance of terms" },
  { id: "platform", title: "About Nidlo" },
  { id: "eligibility", title: "Eligibility" },
  { id: "account", title: "Accounts & security" },
  { id: "roles", title: "Clients & designers" },
  { id: "orders", title: "Orders & payments" },
  { id: "designer-obligations", title: "Designer obligations" },
  { id: "refunds", title: "Cancellations & refunds" },
  { id: "fitscan", title: "Body measurements" },
  { id: "prohibited", title: "Prohibited conduct" },
  { id: "ip", title: "Intellectual property" },
  { id: "user-content", title: "Your content" },
  { id: "third-party", title: "Third-party services" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "indemnity", title: "Indemnification" },
  { id: "termination", title: "Suspension & termination" },
  { id: "changes", title: "Changes to these terms" },
  { id: "governing-law", title: "Governing law" },
  { id: "disputes", title: "Dispute resolution" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <AppShell bare>
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
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
            Welcome to <strong>Nidlo</strong>. These Terms of Service
            (&ldquo;Terms&rdquo;) form a legally binding agreement between you
            and Nidlo. Nidlo is incorporated in the Republic of Ghana, so
            Ghanaian law is the default governing framework set out below. That
            said, Nidlo is a global service: we welcome users from any country
            where it is lawful to use the Platform, and where you are a consumer
            we will respect the mandatory protections of the law in your country
            of residence. Please read these Terms carefully. They affect your
            legal rights and obligations.
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
          <Section id="acceptance" index={1} title="Acceptance of terms">
            <p>
              By creating a Nidlo account, accessing or using any part of the
              Platform, you (&ldquo;you&rdquo;, &ldquo;User&rdquo;) confirm that
              you have read, understood and agree to be bound by these Terms,
              our{" "}
              <Link
                href="/privacy"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Privacy Policy
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
              page. If you do not agree to any part of these Terms, you must not
              use the Platform.
            </p>
          </Section>

          <Section id="platform" index={2} title="About Nidlo">
            <p>
              Nidlo is a global marketplace that connects clients with
              independent custom-fashion designers, tailors and seamstresses.
              Through the Platform, clients can discover designers, commission
              custom garments, provide measurements (manually or via Fitscan),
              pay for orders and track progress in real time. Nidlo launched in
              Ghana and is opening additional markets in phases; the service is
              designed to scale internationally and is accessible from anywhere
              it is lawful to use it.
            </p>
            <p className="mt-3">
              <strong>
                Nidlo is a venue, not a party to the underlying services
                contract.
              </strong>{" "}
              When a client commissions a designer through Nidlo, the contract
              for the garment is between the client and the designer. Nidlo
              facilitates discovery, communication, payment and dispute
              escalation, but does not itself design, manufacture or deliver
              garments.
            </p>
          </Section>

          <Section id="eligibility" index={3} title="Eligibility">
            <p>To use Nidlo you must:</p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                Be at least <strong>18 years old</strong>, or the age of
                majority in your country of residence, whichever is higher;
              </li>
              <li>
                Have the legal capacity to enter into a binding contract under
                the law of your country of residence;
              </li>
              <li>
                Reside in or operate from a country where Nidlo is open for
                sign-ups. We progressively enable new markets, starting with
                Ghana; if your country is not yet enabled you can still browse
                public pages and join our waitlist, but you will not be able to
                complete onboarding or transact until that market goes live;
              </li>
              <li>
                Not have been previously suspended or removed from Nidlo for
                violating these Terms;
              </li>
              <li>
                Not be barred from using the Platform under any applicable law,
                sanctions regime or court order in any jurisdiction that applies
                to you or to Nidlo.
              </li>
            </ol>
          </Section>

          <Section id="account" index={4} title="Accounts & security">
            <h3 className="text-display mt-2 mb-3 text-lg font-semibold">
              4.1 Creating an account
            </h3>
            <p>
              You sign in to Nidlo using your phone number, verified by a
              one-time password (OTP) delivered by SMS. You may also link an
              email address for receipts and password-less recovery.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              4.2 Keeping your sign-in safe
            </h3>
            <p>
              Your sign-in session is held in a secure, server-side token that
              browser scripts cannot read. We pair this with extra
              anti-impersonation safeguards, fully encrypted connections and
              limits on how often the sign-in endpoints can be tried. The
              practical detail is in our{" "}
              <Link
                href="/cookies"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Cookie &amp; Session Policy
              </Link>
              .
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              4.3 Your responsibilities
            </h3>
            <ol className="marker:text-copper list-decimal space-y-2 pl-6">
              <li>Keep your phone, email and account credentials secure;</li>
              <li>Do not share OTPs or session links with anyone;</li>
              <li>
                Notify us immediately at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                if you suspect unauthorised access to your account;
              </li>
              <li>Provide accurate, current and complete information.</li>
            </ol>
          </Section>

          <Section id="roles" index={5} title="Clients & designers">
            <p>
              Every Nidlo account is implicitly a <strong>client</strong>{" "}
              account. By completing the designer onboarding wizard and creating
              a designer profile you additionally take on the role of a{" "}
              <strong>designer</strong>. The same individual may hold both
              roles.
            </p>
            <p className="mt-3">
              <strong>Designers are independent contractors</strong>, not
              employees, agents or partners of Nidlo. Designers control how,
              when and where they perform their services, subject to the
              obligations they accept when listing on the Platform.
            </p>
          </Section>

          <Section id="orders" index={6} title="Orders & payments">
            <h3 className="text-display mt-2 mb-3 text-lg font-semibold">
              6.1 Prices &amp; currency
            </h3>
            <p>
              At launch, prices on Nidlo are displayed in{" "}
              <strong>Ghana Cedis (GHS)</strong> unless otherwise stated.
              Internally we account for money in pesewas (1 GHS = 100 pesewas)
              and convert to the displayed currency at every payment-provider
              boundary. As we open additional markets we will display prices in
              the relevant local currency, with conversion rates and any
              cross-border fees shown before you confirm payment.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              6.2 Payment methods
            </h3>
            <p>
              Payments are processed by licensed, regulated third-party payment
              service providers. Depending on your country and payment method we
              route the transaction through the most appropriate provider (for
              example, mobile-money networks via a local payments partner, or
              cards via an international card-payment processor). Nidlo never
              sees or stores card numbers, mobile-wallet PINs or banking
              credentials. Those remain with the relevant payment provider,
              which is independently regulated by the financial-services
              authority of its home jurisdiction.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              6.3 Nidlo is a marketplace, not a money services business
            </h3>
            <p>
              <strong>
                Nidlo does not hold customer funds, operate a wallet, take
                deposits or act as an escrow agent.
              </strong>{" "}
              We are a marketplace that introduces clients to designers and
              arranges payment via third-party providers. When you pay for an
              order, the payment is instructed directly to the designer&apos;s
              payout wallet through our regulated payment partner. Nidlo only
              ever retains the marketplace fee described in section&nbsp;6.4,
              and only as remuneration for facilitating the introduction and the
              technical platform. We do not operate as a payment institution,
              money transmitter or e-money issuer in any jurisdiction.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              6.4 Marketplace fee &amp; pass-through payouts
            </h3>
            <p>
              Each successful order is subject to a transparent marketplace fee.
              The fee, currently a percentage of the order value with a small
              floor, is deducted at the payment-provider level before the
              remainder is settled to the designer. Settlement is triggered
              automatically when a payment succeeds, so the designer receives
              the net amount in the same flow as the client pays. There is no
              holding period and no Nidlo-controlled balance. The only reason we
              ask designers to deliver on time is operational quality, not
              because we are holding their money.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              6.5 Refunds &amp; reversals
            </h3>
            <p>
              Because funds clear straight through, any refund is a reversal
              instructed back through the original payment provider; we do not,
              and cannot, refund out of a Nidlo-held balance. Where a designer
              fails to deliver, we will work with you and the payment provider
              to reverse the transaction to the extent the provider&apos;s
              scheme rules allow. See section&nbsp;8 for the full refund
              treatment.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              6.6 Receipts &amp; records
            </h3>
            <p>
              You can view receipts, order history and (for designers) payout
              history inside the Platform. We retain transaction records in line
              with applicable tax and anti-money-laundering record-keeping
              obligations in the jurisdictions in which we operate (typically
              six years in Ghana, with equivalent or longer periods elsewhere).
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              6.7 Authorisations
            </h3>
            <p>
              By placing an order, you authorise Nidlo and the relevant payment
              provider to charge your chosen payment method for the order value,
              the marketplace fee, and any applicable taxes, duties or provider
              fees disclosed before checkout.
            </p>
          </Section>

          <Section
            id="designer-obligations"
            index={7}
            title="Designer obligations"
          >
            <p>Designers commit to:</p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                Present an honest portfolio that reflects their own work or
                clearly attributed collaborations;
              </li>
              <li>
                Communicate timely and respectfully with clients via the
                Platform&apos;s messaging system;
              </li>
              <li>
                Quote prices, lead times and material lists accurately before
                accepting an order;
              </li>
              <li>
                Deliver garments that meet the agreed specification, quality and
                timeline;
              </li>
              <li>
                Use any client measurement data, photographs or personal
                information strictly for the purposes of fulfilling the order;
              </li>
              <li>
                Pay any applicable taxes on income earned through Nidlo,
                according to the rules of the tax authority in their country of
                residence;
              </li>
              <li>
                Not solicit clients to transact off-platform to avoid platform
                fees (see Section&nbsp;10).
              </li>
            </ol>
          </Section>

          <Section id="refunds" index={8} title="Cancellations & refunds">
            <p>
              Because each garment is custom made and funds clear directly from
              client to designer through our payment partner, refund handling
              depends on the stage of the order. In every case the refund is
              processed as a reversal through the original payment method; Nidlo
              does not pay refunds from a held balance because it does not hold
              one.
            </p>
            <DataTable
              head={["Order stage", "Default refund treatment"]}
              rows={[
                [
                  "Before designer accepts the order",
                  "Full reversal of the order value (marketplace fee returned with the order)",
                ],
                [
                  "After designer accepts but before any work begins",
                  "Reversal less any documented sourcing costs",
                ],
                [
                  "Materials sourced or cutting begun",
                  "Partial reversal at the designer's reasonable discretion, in line with their published cancellation policy",
                ],
                [
                  "Garment substantially complete or delivered",
                  "No refund unless the delivered item materially fails to meet the agreed specification",
                ],
              ]}
            />
            <p className="mt-3">
              If a designer&apos;s cancellation policy on their profile differs
              from these defaults, the published policy applies. Disputes that
              cannot be resolved bilaterally can be escalated to Nidlo support,
              which will mediate in good faith and, where the facts justify it,
              instruct the payment provider to reverse the transaction. We do
              not operate a formal escrow at any stage.
            </p>
          </Section>

          <Section id="fitscan" index={9} title="Body measurements (Fitscan)">
            <p>
              Fitscan is an AI-assisted body-measurement service operated by
              Nidlo. By uploading photographs to Fitscan you confirm that:
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                The photographs are of yourself, or of a person who has given
                you their informed consent to be measured;
              </li>
              <li>
                You consent to your photographs being processed by our
                measurement pipeline, which (where enabled) includes validation
                by an external AI-model provider under a written data-processing
                agreement;
              </li>
              <li>
                You understand that the resulting measurements are estimates and
                may need to be adjusted by you or your designer for the best
                fit.
              </li>
            </ol>
            <p className="mt-3">
              Full data-handling rules for Fitscan are set out in our{" "}
              <Link
                href="/privacy#fitscan"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </Section>

          <Section id="prohibited" index={10} title="Prohibited conduct">
            <p>You agree not to use Nidlo to:</p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>
                Violate the law of any jurisdiction that applies to you, your
                designer counter-party, or Nidlo;
              </li>
              <li>Post false, misleading, fraudulent or infringing content;</li>
              <li>
                Impersonate another person or misrepresent your affiliation;
              </li>
              <li>
                Harass, threaten, intimidate or discriminate against other
                users;
              </li>
              <li>
                Circumvent or attempt to circumvent the marketplace fee by
                moving transactions off-platform after being matched on Nidlo;
              </li>
              <li>
                Access, scrape, crawl or copy the Platform by automated means
                without our prior written consent;
              </li>
              <li>
                Reverse-engineer, decompile or attempt to derive source code,
                algorithms or non-public APIs;
              </li>
              <li>
                Interfere with the Platform&apos;s security, integrity or
                availability, or probe for vulnerabilities outside an authorised
                programme;
              </li>
              <li>Upload viruses, malware or other harmful code;</li>
              <li>
                Submit identity documents, photographs or content that does not
                belong to you or that you are not authorised to share;
              </li>
              <li>
                Use Nidlo for money-laundering, sanctions evasion, terrorism
                financing or any other illicit purpose.
              </li>
            </ol>
          </Section>

          <Section id="ip" index={11} title="Intellectual property">
            <p>
              The Nidlo name, logo, website, application code, designs, copy and
              visual identity are owned by Nidlo or its licensors and are
              protected by copyright, trademark and other intellectual-property
              laws in Ghana and internationally. Nothing in these Terms
              transfers any of those rights to you.
            </p>
            <p className="mt-3">
              You are granted a limited, revocable, non-exclusive,
              non-transferable licence to access and use the Platform for its
              intended purpose. You must not modify, copy, distribute or create
              derivative works of Nidlo material without our prior written
              consent.
            </p>
          </Section>

          <Section id="user-content" index={12} title="Your content">
            <p>
              You retain ownership of the content you upload to Nidlo
              (&ldquo;User Content&rdquo;), including portfolio images, profile
              text, messages, body measurements and reviews. By uploading User
              Content you grant Nidlo a worldwide, non-exclusive, royalty-free
              licence to host, store, reproduce, display, adapt and transmit
              that content solely for the purpose of operating, securing and
              promoting the Platform.
            </p>
            <p className="mt-3">
              You confirm that you have all the rights necessary to grant this
              licence and that your User Content does not infringe the
              intellectual-property, privacy or other rights of any third party.
            </p>
          </Section>

          <Section id="third-party" index={13} title="Third-party services">
            <p>
              To deliver the Platform we rely on a small set of vetted
              third-party service providers across the categories listed below.
              We choose each provider on the basis of regulatory standing,
              security maturity and contractual commitments to data protection.
              Your use of any embedded third-party feature (for example a
              payment-checkout flow or a map widget) is also subject to that
              provider&apos;s own terms and privacy policy. Nidlo is not
              responsible for the practices of third parties.
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>
                Regulated payment service providers (for mobile-money and card
                payments)
              </li>
              <li>
                SMS gateway providers (for one-time passcodes and order alerts)
              </li>
              <li>
                Transactional email providers (for receipts and account
                messages)
              </li>
              <li>Media storage and image-delivery providers</li>
              <li>
                Mapping and geocoding providers (for address autocomplete)
              </li>
              <li>
                An external AI-model provider (where Fitscan validation is
                enabled)
              </li>
              <li>
                Application-error monitoring and aggregate-analytics providers
              </li>
              <li>Push-messaging provider (for in-app alerts, when enabled)</li>
              <li>
                Cloud infrastructure providers (for hosting and content
                delivery)
              </li>
            </ul>
            <p className="mt-3">
              Where it is helpful for you to know which specific provider
              handles a particular interaction (for example, a hosted card
              checkout), we will tell you at the moment of that interaction so
              you can review the relevant provider&apos;s terms.
            </p>
          </Section>

          <Section id="disclaimers" index={14} title="Disclaimers">
            <p>
              <strong>
                The Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis.
              </strong>{" "}
              To the maximum extent permitted by applicable law, Nidlo disclaims
              all warranties, whether express, implied, statutory or otherwise,
              including implied warranties of merchantability, fitness for a
              particular purpose, non-infringement and accuracy.
            </p>
            <p className="mt-3">
              Nidlo does not guarantee that the Platform will be uninterrupted,
              secure or error-free, nor that any particular designer&apos;s
              workmanship, lead time or pricing will meet your expectations.
              Body-measurement outputs from Fitscan are estimates and should be
              confirmed with your designer before any cutting begins.
            </p>
          </Section>

          <Section id="liability" index={15} title="Limitation of liability">
            <p>
              To the maximum extent permitted by applicable law, Nidlo, its
              founders, employees, agents and licensors will not be liable for
              any indirect, incidental, special, consequential, punitive or
              exemplary damages, including loss of profits, goodwill, data,
              business or reputation, arising out of or in connection with your
              use of the Platform.
            </p>
            <p className="mt-3">
              <strong>
                Our aggregate liability for any and all claims arising in any
                twelve-month period will not exceed the greater of (a) the
                marketplace fees you paid to Nidlo (excluding amounts paid to
                designers) in that period, or (b) the local-currency equivalent
                of USD&nbsp;200.
              </strong>{" "}
              Nothing in these Terms excludes or limits any liability that
              cannot be excluded or limited under the law that applies to you,
              including liability for fraud, gross negligence, death or personal
              injury caused by negligence, or any liability that cannot be
              excluded as a matter of mandatory consumer protection.
            </p>
          </Section>

          <Section id="indemnity" index={16} title="Indemnification">
            <p>
              You agree to indemnify, defend and hold harmless Nidlo, its
              officers, founders, employees, agents and affiliates from and
              against any claim, demand, liability, loss or expense (including
              reasonable legal fees) arising from (a) your use of the Platform,
              (b) your breach of these Terms, (c) your violation of any law or
              of any third-party right, or (d) any User Content you upload.
            </p>
          </Section>

          <Section id="termination" index={17} title="Suspension & termination">
            <h3 className="text-display mt-2 mb-3 text-lg font-semibold">
              17.1 By you
            </h3>
            <p>
              You may stop using Nidlo and request deletion of your account at
              any time through our{" "}
              <Link
                href="/data-deletion"
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                Data Deletion
              </Link>{" "}
              page.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              17.2 By Nidlo
            </h3>
            <p>
              We may suspend or terminate your account, with or without notice,
              if we have reasonable grounds to believe that:
            </p>
            <ol className="marker:text-copper mt-3 list-decimal space-y-2 pl-6">
              <li>You have violated these Terms or any applicable law;</li>
              <li>You have submitted fraudulent or falsified information;</li>
              <li>
                Your continued use poses a security or trust risk to other
                users;
              </li>
              <li>
                We are required to do so by law, regulator or court order.
              </li>
            </ol>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              17.3 Survival
            </h3>
            <p>
              Some sections of these Terms are written to survive termination.
              These include intellectual property, disclaimers, limitation of
              liability, indemnification, governing law and dispute resolution.
              They continue in effect even after your account has gone.
            </p>
          </Section>

          <Section id="changes" index={18} title="Changes to these terms">
            <p>
              We may update these Terms from time to time. When we do, we will
              update the &ldquo;Effective&rdquo; date above and, for material
              changes, notify you in-app or by email before the new version
              takes effect. Continued use of Nidlo after the effective date
              constitutes acceptance of the updated Terms. If you do not agree
              to the changes you must stop using Nidlo.
            </p>
          </Section>

          <Section id="governing-law" index={19} title="Governing law">
            <p>
              These Terms, and any non-contractual obligations arising out of or
              in connection with them, are governed by the laws of the{" "}
              <strong>Republic of Ghana</strong>, without regard to its
              conflict-of-laws rules. Where you are a consumer resident outside
              Ghana, this choice of law does not deprive you of the protection
              of any mandatory provision of consumer law that would otherwise
              apply in your country of residence.
            </p>
          </Section>

          <Section id="disputes" index={20} title="Dispute resolution">
            <p>
              We hope you will contact us first at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-copper font-medium underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              so we can try to resolve any dispute informally and in good faith.
            </p>
            <p className="mt-3">
              If a dispute cannot be resolved within thirty (30) days, the
              parties agree to attempt resolution through{" "}
              <strong>mediation in Accra, Ghana</strong> under the Alternative
              Dispute Resolution Act, 2010 (Act 798), before commencing any
              court proceedings. The competent courts of Ghana have
              non-exclusive jurisdiction over any dispute that proceeds to
              litigation; if you are a consumer resident outside Ghana, you may
              also bring proceedings in the courts of your country of residence
              where mandatory local law gives you that right.
            </p>
            <p className="mt-3">
              Where permitted by law, you and Nidlo agree to bring claims only
              in your individual capacity, and not as part of a class,
              consolidated or representative action.
            </p>
          </Section>

          <Section id="contact" index={21} title="Contact">
            <p>For any question about these Terms, write to us:</p>
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
          Nidlo is incorporated in the Republic of Ghana. These Terms are
          governed by Ghanaian law, including the Data Protection Act&nbsp;2012
          (Act&nbsp;843), the Electronic Transactions Act&nbsp;2008
          (Act&nbsp;772) and the Alternative Dispute Resolution Act&nbsp;2010
          (Act&nbsp;798). They are designed to coexist with the
          consumer-protection, data-protection and tax rules of every country in
          which Nidlo operates.
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
  const headers = head ?? ["Stage", "Outcome"];
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
