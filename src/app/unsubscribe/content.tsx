"use client";

import { useSearchParams } from "next/navigation";

export function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <>
        <h1 className="text-2xl font-bold">Manage email preferences</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We didn&apos;t find an unsubscribe token in this link. Sign in and
          adjust which emails you receive from Nidlo on the preferences page.
        </p>
      </>
    );
  }

  // Backend unsubscribe mutation isn't wired yet (BE-NIDLO-NOTIF-05). Until
  // then, surface an honest "we got the request" message and point users at
  // their preferences page where they can opt out per category right now.
  return (
    <>
      <h1 className="text-2xl font-bold">You&apos;re unsubscribing</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We&apos;ve received your request. While we finish the one-click flow,
        sign in to fine-tune which emails you receive — including the option
        to turn them all off.
      </p>
    </>
  );
}
