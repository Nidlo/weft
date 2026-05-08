"use client";

import { useEffect } from "react";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// `global-error.tsx` replaces the root layout when an uncaught error fires
// during root-layout render. We must ship our own <html> / <body> tags and
// can't rely on Providers (Apollo / Auth / Echo) — they may be the thing
// that broke. Stick to Tailwind utilities served by the bundled stylesheet.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <main className="flex min-h-dvh flex-col items-center justify-center bg-thread-mesh px-4 py-16">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card p-8 text-center shadow-xl sm:p-10">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-copper/40 to-transparent"
              aria-hidden
            />
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-status-error-soft text-status-error ring-1 ring-status-error/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-status-error">
              Critical error
            </p>
            <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Nidlo couldn&apos;t recover.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We hit an unrecoverable error. Reload the page to start fresh —
              your data is safe on the server.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
