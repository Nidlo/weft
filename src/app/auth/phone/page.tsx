import type { Metadata } from "next";

import { PhoneAuthForm } from "./phone-form";

const SIGN_IN_DESCRIPTION =
  "Sign in or create your Nidlo account with your phone number. One-time passcode, no password to remember.";

export const metadata: Metadata = {
  title: "Sign in",
  description: SIGN_IN_DESCRIPTION,
  alternates: {
    canonical: "/auth/phone",
  },
  openGraph: {
    type: "website",
    title: "Sign in to Nidlo",
    description: SIGN_IN_DESCRIPTION,
    url: "/auth/phone",
    siteName: "Nidlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign in to Nidlo",
    description: SIGN_IN_DESCRIPTION,
  },
};

export default function PhoneAuthPage() {
  return <PhoneAuthForm />;
}
