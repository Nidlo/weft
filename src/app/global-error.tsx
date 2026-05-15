"use client";

import { useEffect } from "react";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// `global-error.tsx` replaces the root layout when an uncaught error fires
// during root-layout render. We must ship our own <html> / <body> tags and
// can't rely on Providers (Apollo / Auth / Echo) - they may be the thing
// that broke. Stick to Tailwind utilities served by the bundled stylesheet.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        <main className="bg-thread-mesh flex min-h-dvh flex-col items-center justify-center px-4 py-16">
          <div className="border-border/60 bg-card relative w-full max-w-md overflow-hidden rounded-2xl border p-8 text-center shadow-xl sm:p-10">
            <div
              className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
              aria-hidden
            />
            <div className="bg-status-error-soft text-status-error ring-status-error/20 mx-auto flex size-16 items-center justify-center rounded-2xl ring-1">
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
            <p className="text-status-error mt-6 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Critical error
            </p>
            <h1 className="text-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Nidlo couldn&apos;t recover.
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              We hit an unrecoverable error. Reload the page to start fresh -
              your data is safe on the server.
            </p>
            <button
              type="button"
              onClick={reset}
              className="bg-foreground text-background hover:bg-foreground/90 mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors"
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
