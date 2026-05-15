import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";

const COOKIES_DESCRIPTION =
  "How Nidlo uses cookies, sign-in tokens and similar browser storage. What is set, why, how long it lasts, and how you control it.";

export const metadata: Metadata = {
  title: "Cookie & Session Policy",
  description: COOKIES_DESCRIPTION,
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    type: "article",
    title: "Nidlo Cookie & Session Policy",
    description: COOKIES_DESCRIPTION,
    url: "/cookies",
    siteName: "Nidlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nidlo Cookie & Session Policy",
    description: COOKIES_DESCRIPTION,
  },
};

const EFFECTIVE_DATE = "13 May 2026";
const CONTACT_EMAIL = "snad.dev@gmail.com";
const CONTACT_PHONE_DISPLAY = "+233 20 576 8278";
const CONTACT_PHONE_LINK = "+233205768278";

const SECTIONS = [
  { id: "about", title: "About this policy" },
  { id: "what", title: "What we mean" },
  { id: "essential", title: "Essential cookies" },
  { id: "analytics", title: "Analytics cookies" },
  { id: "third-party", title: "Third-party cookies" },
  { id: "push", title: "Push notification tokens" },
  { id: "local-storage", title: "Local storage" },
  { id: "permissions", title: "Device permissions" },
  { id: "not-used", title: "What we do not use" },
  { id: "manage", title: "Managing cookies" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

export default function CookiesPage() {
  return (
    <AppShell bare>
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Cookies
          </p>
          <h1 className="text-display mt-2 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Cookie &amp; Session Policy
          </h1>
          <p className="text-muted-foreground mt-3 text-sm tabular-nums">
            Effective {EFFECTIVE_DATE}
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm sm:text-base">
            This policy explains the cookies, sign-in tokens, browser storage
            and device permissions <strong>Nidlo</strong> uses, why we use them
            and how you can control them. Read it alongside our{" "}
            <Link
              href="/privacy"
              className="text-copper font-medium underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-copper font-medium underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>
            .
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
              Nidlo (&ldquo;Nidlo&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) keeps the set of cookies and sign-in tokens it
              uses deliberately small. The fewer items we leave on your device,
              the less there is for an attacker to target. This policy is
              anchored in Ghana&apos;s Data Protection Act&nbsp;2012
              (Act&nbsp;843) and is designed to honour equivalent rules in every
              other country where Nidlo is available.
            </p>
          </Section>

          <Section id="what" index={2} title="What we mean">
            <h3 className="text-display mt-2 mb-3 text-lg font-semibold">
              2.1 Cookies
            </h3>
            <p>
              Cookies are small text files a website saves on your device. They
              can be <strong>session cookies</strong> (deleted when you close
              the browser) or <strong>persistent cookies</strong> (kept until
              they expire or you delete them). A cookie can be marked so that
              other scripts on the page cannot read it, and so that the browser
              only sends it back over an encrypted connection. We use both of
              those protections on every cookie that matters for security.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              2.2 Sign-in tokens
            </h3>
            <p>
              A sign-in token is the value a server uses to recognise you across
              requests. Nidlo stores its sign-in token inside a secure,
              server-side cookie that other scripts on the page cannot read.
              This is safer than the older pattern of saving tokens in regular
              browser storage, where any script on the page could read or copy
              them.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              2.3 Browser storage and similar technologies
            </h3>
            <p>
              Browsers also offer other ways for sites to keep small amounts of
              data on your device. We treat all of these the same as cookies for
              transparency, even though strictly they are different mechanisms.
            </p>
          </Section>

          <Section
            id="essential"
            index={3}
            title="Essential cookies and sign-in tokens"
          >
            <p>
              These items are <strong>strictly necessary</strong> for Nidlo to
              work. Without them you cannot sign in, place orders or stay signed
              in across pages. Under Act&nbsp;843, and under the equivalent
              rules elsewhere, these cookies do not require advance consent
              because they are essential to deliver the service you have asked
              for.
            </p>
            <CookieTable
              rows={[
                [
                  "nidlo_session",
                  "Nidlo (first-party)",
                  "Holds the secure reference that keeps you signed in.",
                  "Secure, server-side. Expires when the session ends or after 2 hours of inactivity.",
                ],
                [
                  "Anti-forgery cookie",
                  "Nidlo (first-party)",
                  "Pairs with your sign-in token to block impersonation and request-forgery attempts.",
                  "Secure. 2 hours.",
                ],
                [
                  "nidlo_session_remember (optional)",
                  "Nidlo (first-party)",
                  "Set only if you tick 'Remember me'. Keeps your session alive across browser restarts.",
                  "Secure, server-side. Up to 30 days.",
                ],
                [
                  "Language and locale preference",
                  "Nidlo (first-party)",
                  "Remembers the language and country settings you have chosen.",
                  "Up to 12 months.",
                ],
              ]}
            />
          </Section>

          <Section id="analytics" index={4} title="Analytics cookies">
            <p>
              We measure anonymised, aggregate usage of the Platform to
              understand what is working and what is not. Analytics cookies are
              only set after you accept analytics, where the law in your country
              requires that opt-in. You can change your mind at any time through
              Settings &rsaquo; Privacy.
            </p>
            <CookieTable
              rows={[
                [
                  "Product-analytics cookie",
                  "Third-party analytics provider",
                  "Identifies a device (not a person) so that anonymised events such as 'search performed' can be aggregated.",
                  "Up to 1 year.",
                ],
                [
                  "Web-analytics cookies",
                  "Third-party web-analytics provider",
                  "Counts visits and sessions and shows where traffic comes from. IP addresses are truncated in transit.",
                  "Up to 2 years.",
                ],
              ]}
            />
          </Section>

          <Section
            id="third-party"
            index={5}
            title="Third-party cookies and embeds"
          >
            <p>
              Some features rely on cookies set by an outside provider at the
              moment that feature loads. We do not control these cookies. When
              you trigger one of these flows (for example, a payment checkout or
              a map widget), the relevant provider will be identified at that
              step so you can read its own privacy notice.
            </p>
            <CookieTable
              rows={[
                [
                  "Mapping cookies",
                  "Mapping and geocoding provider",
                  "Powers address autocomplete and the map view when you pick a location during onboarding or order creation.",
                  "Set by the provider per its own policy.",
                ],
                [
                  "Bot-protection cookies",
                  "Bot-protection provider (used by some of our suppliers)",
                  "Detects automated traffic and blocks abuse.",
                  "Up to 30 days.",
                ],
                [
                  "Card-checkout cookies",
                  "Card-payment processor",
                  "Set on the hosted checkout page when you pay by card or hosted mobile money.",
                  "Session, or per the provider's own policy.",
                ],
                [
                  "Mobile-money payment cookies",
                  "Mobile-money payment processor",
                  "Set on the payment pages we route mobile-money transactions through.",
                  "Per the provider's own policy.",
                ],
              ]}
            />
          </Section>

          <Section id="push" index={6} title="Push-notification tokens">
            <p>
              When push notifications are launched (planned for private beta and
              after), Nidlo will use a push-messaging provider to deliver alerts
              about order status, messages and payment events. You will not
              receive any push notification unless you have opted in.
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>
                The provider creates a per-device push token that the Nidlo app
                stores against your account.
              </li>
              <li>
                A push token is not strictly a cookie, but it functions like one
                for transparency: it is the value that lets us reach your
                device.
              </li>
              <li>
                You can revoke push notifications at any time from your browser,
                your operating-system settings, or Settings &rsaquo;
                Notifications inside Nidlo. Revoking removes the token from our
                records.
              </li>
            </ul>
          </Section>

          <Section id="local-storage" index={7} title="Browser storage usage">
            <p>
              Unlike many web apps,{" "}
              <strong>
                Nidlo does not keep sign-in tokens or sensitive personal data in
                the kind of browser storage that any script on the page could
                read
              </strong>
              . That decision is deliberate: storage of that type can be read by
              malicious scripts, which makes stolen tokens a real risk. We use
              the secure server-side sign-in cookie described above instead.
            </p>
            <p className="mt-3">
              We do use ordinary browser storage for a few low-risk preferences
              only, such as:
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>Theme preference (light or dark).</li>
              <li>Last-viewed dashboard tab.</li>
              <li>Onboarding-tour progress.</li>
              <li>
                Draft order content, so you do not lose typed input on a page
                reload.
              </li>
            </ul>
            <p className="mt-3">
              None of these items identify you personally, and you can clear
              them at any time from your browser&apos;s site-settings menu.
            </p>
          </Section>

          <Section id="permissions" index={8} title="Device permissions">
            <p>
              Some Nidlo features need a permission from your device. We only
              request a permission the first time the feature is used, and you
              can revoke it at any time from your browser or operating-system
              settings.
            </p>
            <CookieTable
              head={["Permission", "Feature", "When requested"]}
              rows={[
                [
                  "Camera",
                  "Fitscan body-scan photos · QR-scanned profile sharing",
                  "Only when you open the relevant feature",
                ],
                [
                  "Location",
                  "Google Maps address autocomplete during onboarding and order delivery",
                  "Only when you choose to share location",
                ],
                [
                  "Notifications",
                  "Push alerts for order status, messages and payments",
                  "Only when you opt in",
                ],
                ["Microphone", "Not used", "Never requested"],
              ]}
            />
          </Section>

          <Section id="not-used" index={9} title="What we do not use">
            <p>
              Nidlo does <strong>not</strong> use:
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>Advertising or remarketing cookies.</li>
              <li>Cross-site tracking pixels.</li>
              <li>Browser-fingerprinting tools.</li>
              <li>Social-media auto-tracking pixels.</li>
              <li>
                Ordinary browser storage as the primary place to keep your
                sign-in token.
              </li>
            </ul>
          </Section>

          <Section
            id="manage"
            index={10}
            title="Managing cookies & permissions"
          >
            <h3 className="text-display mt-2 mb-3 text-lg font-semibold">
              10.1 In Nidlo
            </h3>
            <p>
              Where the law requires consent for non-essential cookies (such as
              analytics), Nidlo will present a banner the first time you visit.
              You can change your choices later under Settings &rsaquo; Privacy.
            </p>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              10.2 In your browser
            </h3>
            <p>
              You can also block or delete cookies in your browser. Help links:
            </p>
            <ul className="marker:text-copper mt-3 list-disc space-y-2 pl-6">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  Apple Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-copper font-medium underline-offset-2 hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <h3 className="text-display mt-6 mb-3 text-lg font-semibold">
              10.3 What happens if you block cookies
            </h3>
            <p>
              If you block our <strong>essential</strong> cookies, Nidlo will
              not be able to sign you in or protect your account against
              impersonation attempts, and you will not be able to use the
              Platform. Blocking <strong>third-party</strong> cookies may break
              features such as address autocomplete, the hosted card checkout,
              and mobile-money payment pages.
            </p>
          </Section>

          <Section id="changes" index={11} title="Changes to this policy">
            <p>
              We may update this policy as we add or remove tooling, or as the
              rules in any of the countries where Nidlo operates evolve. We will
              update the &ldquo;Effective&rdquo; date above and notify you
              in-app of any material change.
            </p>
          </Section>

          <Section id="contact" index={12} title="Contact">
            <p>For any cookie or session question:</p>
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
          Nidlo is incorporated in the Republic of Ghana. This Cookie &amp;
          Session Policy is anchored in Ghana&apos;s Data Protection
          Act&nbsp;2012 (Act&nbsp;843) and the Electronic Transactions
          Act&nbsp;2008 (Act&nbsp;772), and is designed to honour equivalent
          cookie and session rules in every country where Nidlo is available.
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

interface CookieTableProps {
  head?: string[];
  rows: string[][];
}

function CookieTable({ head, rows }: CookieTableProps) {
  const headers = head ?? ["Name", "Provider", "Purpose", "Duration & flags"];
  return (
    <div className="border-border/60 mt-3 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-foreground/80 px-4 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap uppercase"
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
