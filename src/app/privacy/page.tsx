import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Nidlo Privacy Policy — how we collect, use, and protect your personal data.",
};

const EFFECTIVE_DATE = "1 May 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          This Privacy Policy explains how <strong>Nidlo</strong> collects, uses, and protects your
          personal information when you use our platform.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> name, phone number, email address, country
          </li>
          <li>
            <strong>Profile data:</strong> photos, bio, portfolio images, body measurements (stored
            encrypted, retained for 30 days unless you save them)
          </li>
          <li>
            <strong>Transaction data:</strong> order details, payment references (not card numbers —
            those are held by Moolre / Paystack)
          </li>
          <li>
            <strong>Usage data:</strong> pages visited, search queries, device type (via analytics)
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide, operate, and improve the platform</li>
          <li>Process payments and payouts</li>
          <li>Send order status updates, OTPs, and service notifications</li>
          <li>Detect and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>3. Body Measurements and AI Processing</h2>
        <p>
          If you use our Fitscan body-scanning feature, photos are processed on our servers to extract
          measurements. Photos are deleted immediately after processing unless you explicitly save your
          measurements. Measurements are only shared with designers on orders you create.
        </p>
        <p>
          We use Anthropic Claude to validate measurement quality. Photos are only sent to Anthropic
          after you provide explicit consent (subject ID token). Anthropic&apos;s data handling is governed
          by their privacy policy.
        </p>

        <h2>4. Sharing Your Information</h2>
        <p>We share data with:</p>
        <ul>
          <li>
            <strong>Designers</strong> — your name, measurements, and order details on commissions you
            place
          </li>
          <li>
            <strong>Payment processors</strong> — Moolre, Paystack (as required for transactions)
          </li>
          <li>
            <strong>Service providers</strong> — hosting (Contabo), media (ImageKit), SMS (Arkesel),
            email (Resend), error monitoring (Sentry)
          </li>
        </ul>
        <p>We do not sell your personal data.</p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your account data while your account is active. Body scan photos are deleted within
          30 days. You may request deletion of your account and all associated data at any time.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
          <li>Object to certain processing</li>
        </ul>
        <p>
          To exercise these rights, contact us at{" "}
          <a href="mailto:privacy@nidlo.com">privacy@nidlo.com</a>.
        </p>

        <h2>7. Security</h2>
        <p>
          We use industry-standard security measures including encrypted connections (TLS), encrypted
          storage, and access controls. No system is 100% secure — please use a strong, unique
          password for your account.
        </p>

        <h2>8. Changes</h2>
        <p>
          We may update this policy. We will notify you of material changes via in-app notification.
          Continued use constitutes acceptance of the updated policy.
        </p>

        <h2>9. Contact</h2>
        <p>
          Privacy questions: <a href="mailto:privacy@nidlo.com">privacy@nidlo.com</a> or visit our{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </main>
  );
}
