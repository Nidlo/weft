# Nidlo Frontend — Completion Roadmap

**Owner:** Snad
**Started:** 2026-05-01
**Goal:** Ship a production-ready PWA MVP that mimics the real-world Ghana fashion-commission flow end-to-end — guest → sign-up → onboarding → designer browse → commission → measurement → pay → track → message → deliver → review. No mock data, no dead buttons, no raw errors in UI, every flow works on a real device. Admin app lives separately at backend `/admin` (Filament) — see [backend/ROADMAP_ADMIN.md](../backend/ROADMAP_ADMIN.md). Backend tasks tracked in [backend/TASKS.md](../backend/TASKS.md). Fitscan tasks in [fitscan/TASKS.md](../fitscan/TASKS.md).

**Live tracking:** each phase checkbox flips as work lands. Backend dependencies surface as `BE-NIDLO-*` tasks, Fitscan deps as `FS-NIDLO-*`, admin deps as `AD-NIDLO-*`. Closed audit findings carry their sprint label, e.g. `(closed A1, FE-CSRF)`.

---

## Principles

- **MVP exclusions (Phase 2 — non-negotiable):** no organizations / multi-member designer studios UI, no escrow / hold-funds (instant-payout MVP), no in-app dispute resolution UI (admin-only via Filament), no designer-to-designer messaging, no public review reply UI, no French / Yoruba / Mooré localization (English-only beta), no multi-country activation beyond GH / NG / CI / TG / BF.
- **Auth-first** for all writes — anonymous can browse public designer pages + the home hero + `/search`, but every interaction that creates state requires Sanctum SPA cookie auth.
- **Sanctum SPA cookie auth + CSRF** — `credentials: 'include'` everywhere, `csrfLink` mirrors `XSRF-TOKEN` cookie as `X-XSRF-TOKEN` header (closed A1, FE-CSRF), `ensureCsrfCookie()` warmed once per page load in `AuthProvider`, `resetCsrfState()` on logout. Never `localStorage` for tokens.
- **Capabilities model (no `role` enum)** — `user.isDesigner` is computed from the existence of a `designer_profiles` row. Guards check `user.isDesigner` for designer-only routes.
- **Hydration-safe Zustand v5** — `skipHydration: true` + `persist.onFinishHydration()` + `persist.rehydrate()` (the `onRehydrateStorage` callback is broken for `setState`). `isAuthenticated` is NOT persisted; computed after hydration. Guards check `_hasHydrated` before redirecting.
- **Every async UI path has loading + error states** — no blank screens. Skeletons for queries, friendly errors for failures.
- **Every error path is env-gated** — production shows user-friendly text only; raw GraphQL / SQL / stack traces only in `development` / `testing` / `staging`.
- **All money in pesewas** (integers); display conversion to GHS via `formatPesewas()` at the edge. Moolre takes GHS decimals; conversion lives in `MoolreService` on the backend, never inferred client-side.
- **Reuse before create** — `src/components/ui/*` (shadcn), `src/components/shared/*`, `src/lib/hooks/*`, `src/lib/utils/*` already cover most needs. Search before adding.
- **Location is mandatory for "near you"** — `LocationPicker` (Google Maps) used in onboarding + designer search; geolocation hook (`use-geolocation.ts`) for "near me" in `/search`.
- **English only for beta** — no `next-intl` scaffolding yet; the 5 active country list is English-friendly (GH / NG / CI [English-fluent business culture] / TG / BF). Re-evaluate when CI / TG / BF flip from "warm-spare" to "active rollout".
- **shadcn/ui + Radix** — all modals use `Dialog` (focus trap built-in); icon-only buttons need `aria-label`.
- **Tailwind v4** uses `@theme` directive in CSS, not `tailwind.config.js`. Brand tokens drive `bg-*` / `text-*` / radius.

## Status legend

| Icon | Meaning |
|---|---|
| ✅ | Done — code shipped and behaves correctly |
| 🟡 | Partial — code exists, gaps / bugs / mocks remain |
| ⬜ | Not started |
| 📐 | Needs design / Figma confirmation before code lands |
| 🔒 | Phase 2 — explicitly deferred |
| 🐛 | Broken — critical bug blocks the surface |

---

## Phase 0 — Rule updates

Must land in [.claude/rules.md](../.claude/rules.md) before this roadmap is authoritative.

- [x] **Rule: every `useSearchParams` page wraps in `Suspense`** — added as `W-NEXT-10` in [.claude/rules.md](../.claude/rules.md). All 4 sites comply (closed B7). (closed B30)
- [x] **Rule: never store auth tokens in `localStorage`** — already enforced as `A-03` in [.claude/rules.md](../.claude/rules.md) (universal). (verified B30)
- [x] **Rule: every monetary value rendered through `formatPesewas`** — added as `W-NEXT-11`. (closed B30)
- [x] **Rule: every Zustand v5 persisted store uses the `skipHydration` + `onFinishHydration` pattern** — added as `W-NEXT-12` with carve-out for plain-field stores that don't `setState` after hydrate. (closed B30)
- [x] **Rule: every icon-only `Button` / `Link` has `aria-label`** — added as `W-NEXT-13`. Sweep complete (closed B16, A11Y-01). (closed B30)
- [x] **Rule: every guard waits for `_hasHydrated`** — added as `W-NEXT-14`. Recommends `useAuthGuard` / `useGuestGuard` over rolling-your-own. (closed B30)

---

## Phase 0.A — Design tokens & typography (cross-cutting)

**Status:** 🟡 Foundations partially landed. **Goal:** consistent, brand-driven token surface so every screen renders the Nidlo identity without literal `Color(0xff…)` / `text-yellow-100` patches.

Tailwind v4 uses the `@theme` directive in CSS — there is no `tailwind.config.js` to edit. The token strategy is:

1. **Brand colors** — define `--color-primary` / `--color-secondary` / `--color-accent` / `--color-warm-cream` / `--color-status-success` / `--color-status-pending` / `--color-status-error` in [src/app/globals.css](src/app/globals.css) under `@theme inline`.
2. **Semantic surface tokens** — `bg-status-success-soft`, `bg-status-pending-soft`, `bg-status-error-soft` (replaces the literal `bg-yellow-100` / `bg-green-100` / `bg-red-100` scattered in payment and order components per audit M9).
3. **Typography scale** — Geist Sans (body) + Geist Mono (numbers) already wired in [layout.tsx](src/app/layout.tsx). Need a 6-tier scale: `text-display` / `text-heading-1..3` / `text-body-lg` / `text-body` / `text-body-sm` / `text-caption`. Match Tailwind v4 fluid-text utilities.
4. **Radius scale** — `rounded-xs` (4) / `rounded-sm` (6) / `rounded` (8) / `rounded-lg` (12) / `rounded-xl` (16) / `rounded-pill` (9999). Already partly conventional via shadcn.
5. **Spacing scale** — Tailwind 4pt base. No custom additions until a screen actually needs them.

| # | Item | Status | Notes |
|---|---|---|---|
| 0.A.1 | `@theme inline` block with brand color tokens | ✅ | [globals.css](src/app/globals.css) — status token variables added. (closed B7) |
| 0.A.2 | Semantic status surface tokens (`bg-status-success-soft` etc.) | ✅ | Light + dark CSS custom properties for all 4 status hues. (closed B7) |
| 0.A.3 | Typography scale tokens (6 tiers) | ⬜ | Drop-in replacements for ad-hoc `text-2xl` / `text-lg` use. |
| 0.A.4 | Storybook for `components/ui/*` token visualization | ⬜ | Optional — only if Snad asks for it. |
| 0.A.5 | Brand-color sweep — replace `bg-yellow-100` / `bg-green-100` / `bg-red-100` / `bg-blue-100` literals with semantic tokens | ✅ | Swept payment, order, wallet, reviews, verification-documents. Closes audit M9. (closed B7) |
| 0.A.6 | Dark mode decision — ship in beta or Phase 2 | 📐 | `next-themes` is installed but no `ThemeProvider` is mounted. If beta-yes: wire `ThemeProvider`, audit every screen for contrast. If Phase 2: add explicit `🔒` to Phase 11.6. |

**Acceptance:** `grep -r "bg-(yellow\|green\|red\|blue)-100" src/` returns 0 hits in `components/payment/` and `components/order/`. Every newly-touched screen passes a `/x-check` for token usage.

---

## Phase 0.B — Foundations / cross-cutting infra

**Status:** 🟡 Most foundations shipped via A1–A7; gaps below.

| # | Item | Status | Notes |
|---|---|---|---|
| 0.B.1 | Apollo Client v4 with `csrfLink` + `errorLink` + `uploadLink` chain | ✅ | Closed A1, FE-CSRF. [client.ts](src/lib/graphql/client.ts) + [csrf.ts](src/lib/graphql/csrf.ts). |
| 0.B.2 | `ensureCsrfCookie()` warmed in `AuthProvider` | ✅ | Closed A1. [auth-provider.tsx](src/providers/auth-provider.tsx). |
| 0.B.3 | `resetCsrfState()` on logout | ✅ | Closed A1. Consolidated into [use-logout.ts](src/lib/hooks/use-logout.ts). |
| 0.B.4 | Zustand v5 hydration pattern (`skipHydration` + `onFinishHydration` + `persist.rehydrate()`) | ✅ | [auth.ts](src/lib/stores/auth.ts) — auth store needs the workaround because it sets `_hasHydrated` / `isAuthenticated` from `onFinishHydration`. Per W-NEXT-12, plain-field stores (`client-onboarding.ts`, `onboarding.ts`, `blueprint.ts`) don't need the workaround — they don't `setState` after rehydrate. |
| 0.B.5 | `AuthProvider` with `_hasHydrated` guard + `Me` validation | ✅ | [auth-provider.tsx](src/providers/auth-provider.tsx). Note: caught network errors do NOT logout, only explicit `Unauthenticated.` errors do. |
| 0.B.6 | Echo realtime provider (cookie auth + custom authorizer) | ✅ | [realtime-provider.tsx](src/providers/realtime-provider.tsx) + [echo.ts](src/lib/echo.ts). Open gap: refetch-on-reconnect. |
| 0.B.7 | Suspense around every `useSearchParams` page | ✅ | All 4 pages wrapped. (closed B7, audit H8) |
| 0.B.8 | Per-route `error.tsx` for high-stakes routes (payment, onboarding) | ✅ | [pay/error.tsx](src/app/orders/[id]/pay/error.tsx) + [onboarding/error.tsx](src/app/onboarding/error.tsx) + [onboarding/client/error.tsx](src/app/onboarding/client/error.tsx). (closed B7) |
| 0.B.9 | Sentry frontend SDK wiring | ⬜ | FE-NIDLO-OPS-01 — currently `errorLink` logs to console only (audit M20). Need `@sentry/nextjs`, env-gated DSN, source-map upload. |
| 0.B.10 | `apolloClient.clearStore()` consolidated in `useLogout()` | ✅ | Closed A2, FE-LOGOUT. [use-logout.ts](src/lib/hooks/use-logout.ts). PII no longer bleeds between users. |
| 0.B.11 | `useGuestGuard` + `useAuthGuard` consolidated | ✅ | [use-guest-guard.ts](src/lib/hooks/use-guest-guard.ts) + [use-auth-guard.ts](src/lib/hooks/use-auth-guard.ts); `auth/role/page.tsx` now uses `useAuthGuard` (closed B8, H6). |
| 0.B.12 | Apollo retry-link on 419 mid-mutation | ✅ | `RetryLink` in [client.ts](src/lib/graphql/client.ts) detects `ServerError.statusCode === 419`, calls `resetCsrfState()` + `ensureCsrfCookie()`, and retries once with the refreshed cookie. (closed B10, FE-NIDLO-AUTH-13) |
| 0.B.13 | Apollo `fetchPolicy` strategy (`cache-first` for static lookups) | ✅ | `getCountries`, `getCities`, `getSpecializations`, `getFashionInterests` all use `cache-first`. (closed B8, M12) |
| 0.B.14 | Codegen for `types/graphql.ts` | ⬜ | Audit M / T5 — currently hand-written. Set up `graphql-codegen` against backend schema; wire to `yarn dev`. FE-NIDLO-OPS-03. |
| 0.B.15 | Echo refetch-on-reconnect across realtime subscribers | ✅ | New [`useEchoReconnect`](src/lib/hooks/use-echo-reconnect.ts) hook listens on Pusher's `state_change` event and fires a callback when transitioning back to `connected` from `disconnected`/`unavailable`/`connecting`/`failed`. Wired into messages list, conversation page, and `RealtimeProvider` (re-syncs unread counts). (closed B18) |
| 0.B.16 | Optimistic-update rollback audit | ✅ | `grep "optimisticResponse"` returns zero hits in `src/`. All mutations are fire-and-refetch — no rollback liability. (closed B26, FE-NIDLO-ORDER-15) |
| 0.B.17 | Centralize `process.env.NEXT_PUBLIC_APP_URL` fallback | ✅ | [lib/config.ts](src/lib/config.ts) — single `APP_URL` export, imported by layout, sitemap, robots, json-ld. (closed B7, FE-NIDLO-LEGAL-04) |

---

## Phase 0.C — Brand identity (Nidlo rebrand sweep)

**Status:** 🟡 Memory says rebrand is decided; code still says StitchHub everywhere. Audit M10 + audit memo for FE-M10.

Code identifiers (`stitchub`, `StitchHub`) stay untouched per project policy — this phase is **user-facing strings only**.

| # | File / surface | Status | Action |
|---|---|---|---|
| 0.C.1 | `<title>` template + default in [layout.tsx:21-22](src/app/layout.tsx#L21) | ✅ | Already "Nidlo — Where every stitch begins". |
| 0.C.2 | OpenGraph `siteName` in [layout.tsx:38](src/app/layout.tsx#L38) | ✅ | Already "Nidlo". |
| 0.C.3 | PWA manifest [public/manifest.webmanifest](public/manifest.webmanifest) — `name`, `short_name`, `description` | ✅ | Updated to Nidlo. (closed B7) |
| 0.C.4 | Auth layout brand block at [auth/layout.tsx:46](src/app/auth/layout.tsx#L46) | ✅ | Already "Nidlo". |
| 0.C.5 | Header brand text at [header.tsx:25](src/components/layout/header.tsx#L25) | ✅ | Already "Nidlo". |
| 0.C.6 | Toast copy "Welcome to StitchHub!" in [auth/role/page.tsx](src/app/auth/role/page.tsx) | ✅ | Already "Welcome to Nidlo!". |
| 0.C.7 | Onboarding copy in [onboarding/client/page.tsx](src/app/onboarding/client/page.tsx) + [client/step-finish.tsx](src/app/onboarding/client/step-finish.tsx) | ✅ | No StitchHub strings found — already clean. |
| 0.C.8 | Share buttons in [share-buttons.tsx](src/components/shared/share-buttons.tsx) | ✅ | Already uses "Nidlo". |
| 0.C.9 | `home-discovery.tsx` copy strings | ✅ | No StitchHub strings — already clean. |
| 0.C.10 | Persisted Zustand keys (`stitchhub-auth`, `nidlo:auth:pendingPhone` is already correct in sessionStorage) | 📐 | Decision: keep `stitchhub-auth` for back-compat (renaming wipes everyone's session) or do a one-shot migration on hydration? Snad call. |
| 0.C.11 | Default `NEXT_PUBLIC_APP_URL` fallback | ✅ | `lib/config.ts` uses `localhost:3000` fallback only; no hardcoded domain. (closed B7) |

**Acceptance:** `grep -rn "StitchHub" src/ public/ --include="*.{ts,tsx,json,webmanifest}"` returns 0 hits in user-facing code paths. Code identifiers (`stitchub` import paths, `useStitchhubAuth`-style) are out of scope.

---

## Screen index

Comprehensive list of every route + every meaningful state inside complex pages. Status reflects post-A7 reality. Figma column is **TBD** until Snad ships the design system.

| # | Spec ID | Screen / state | Current file | Figma | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | 01 | Splash / boot | [app-splash.tsx](src/components/shared/app-splash.tsx) | _TBD_ | ✅ | Brand splash (wordmark + tagline + animated bar) gated on `_hasHydrated` with a 600 ms minimum visible window. (closed B26) |
| 2 | 02 | Walkthrough (3-slide carousel) | — NOT BUILT — | _TBD_ | ⬜ | XLent has it; Nidlo doesn't. Decide if MVP wants a brand-onboarding moment. |
| 3 | 03 | Anonymous home / hero | [page.tsx](src/app/page.tsx) | _TBD_ | ✅ | RSC server-rendered hero (B23) with Nidlo tagline (B9) + auth-aware [`HeroCta`](src/components/shared/hero-cta.tsx) island + `<HomeDiscovery>`. (closed B23) |
| 4 | 03.1 | Anonymous designer scroll sections | [home-discovery.tsx](src/components/shared/home-discovery.tsx) | _TBD_ | ✅ | Public scroll lists (recommended designers, near-you, by-specialization). |
| 5 | 04 | Sign-up / sign-in (single screen) | [auth/phone/page.tsx](src/app/auth/phone/page.tsx) | _TBD_ | ✅ | Phone entry (dynamic country selector via `GET_COUNTRIES`, `cache-first` B8) + Google + Apple. Unified OTP path; tests still tracked separately under AUTH-10. |
| 6 | 04.1 | Google OAuth button | [auth/phone/google-sign-in-button.tsx](src/app/auth/phone/google-sign-in-button.tsx) | _TBD_ | ✅ | `@react-oauth/google` v0.13 calling `socialLogin`. |
| 7 | 04.2 | Apple Sign-In | [auth/phone/page.tsx](src/app/auth/phone/page.tsx) | _TBD_ | ✅ | Hidden when `NEXT_PUBLIC_APPLE_CLIENT_ID` not set. AppleID JS SDK loaded inline. |
| 8 | 04.3 | Country code dropdown | [auth/phone/page.tsx](src/app/auth/phone/page.tsx) | _TBD_ | ✅ | Dynamic from `GET_COUNTRIES` query, falls back to GH-only when network fails. Uses `phoneCode`, `phoneDigits`, `phoneStartsWithZero`, `phonePlaceholder`. |
| 9 | 05 | OTP verify (6-digit) | [auth/verify/page.tsx](src/app/auth/verify/page.tsx) | _TBD_ | ✅ | Phone via `sessionStorage` (closed A2, FE-PHONE-URL). 60s resend cooldown. Suspense-wrapped. |
| 10 | 05.1 | OTP resend countdown | [auth/verify/page.tsx](src/app/auth/verify/page.tsx) | _TBD_ | ✅ | 60s timer, "Resend" disabled until 0. |
| 11 | 06 | Role selection | [auth/role/page.tsx](src/app/auth/role/page.tsx) | _TBD_ | ✅ | Uses `useAuthGuard()` with `_hasHydrated` check (closed B8, H6). |
| 12 | 07.1 | Designer onboarding wizard — Step 1: Basic Info | [onboarding/step-basic-info.tsx](src/app/onboarding/step-basic-info.tsx) | _TBD_ | ✅ | Display name, bio, years of experience. |
| 13 | 07.2 | Designer onboarding — Step 2: Specializations | [onboarding/step-specializations.tsx](src/app/onboarding/step-specializations.tsx) | _TBD_ | ✅ | Multi-select from `GET_SPECIALIZATIONS` + custom-add via `CREATE_SPECIALIZATION` mutation. |
| 14 | 07.3 | Designer onboarding — Step 3: Pricing | [onboarding/step-pricing.tsx](src/app/onboarding/step-pricing.tsx) | _TBD_ | ✅ | Min / max GHS — UI in GHS, converted to pesewas at submit. |
| 15 | 07.4 | Designer onboarding — Step 4: Portfolio + Location + T&C | [onboarding/step-portfolio.tsx](src/app/onboarding/step-portfolio.tsx) | _TBD_ | ✅ | ImageKit upload (B22 `next/image`), `LocationPicker` (Google Maps), terms checkbox. Failed uploads now show a persistent retry/dismiss list (closed B20, ONBD-11). |
| 16 | 07.5 | Designer onboarding — Verification documents | [verification-documents.tsx](src/components/shared/verification-documents.tsx) | _TBD_ | ✅ | Upload ID / business cert via ImageKit; status workflow on semantic tokens (B7). |
| 17 | 07.6 | Onboarding completion + redirect | [onboarding/page.tsx](src/app/onboarding/page.tsx) | _TBD_ | ✅ | Calls `completeOnboarding`, sets `onboarded_at`, resets store, redirects `/dashboard`. Uses `useAuthGuard({ requireDesigner: true })` (closed B14). |
| 18 | 08.1 | Client onboarding — Step 1: Name | [onboarding/client/step-basic-info.tsx](src/app/onboarding/client/step-basic-info.tsx) | _TBD_ | ✅ | First name, last name, other names. Store `reset()` after success clears PII (closed B14, M24 / ONBD-16). |
| 19 | 08.2 | Client onboarding — Step 2: Fashion Interests | [onboarding/client/step-interests.tsx](src/app/onboarding/client/step-interests.tsx) | _TBD_ | ✅ | Multi-select from 28 seeded `fashion_interests` across 4 categories with `cache-first` Apollo policy (B8). |
| 20 | 08.3 | Client onboarding — Step 3: Location | [onboarding/client/step-location.tsx](src/app/onboarding/client/step-location.tsx) | _TBD_ | ✅ | `LocationPicker` (Google Maps). Extracts city, region, country, postalCode, lat/lng. |
| 21 | 08.4 | Client onboarding — Step 4: Finish (referral + T&C) | [onboarding/client/step-finish.tsx](src/app/onboarding/client/step-finish.tsx) | _TBD_ | ✅ | Referral code + terms checkbox. Calls `completeClientOnboarding` then resets store. |
| 22 | 09 | Forgot password / reset | — NOT BUILT — | _TBD_ | ⬜ | Phone OTP IS the auth — no password reset is needed for phone-first users. Email-attached flow doesn't exist yet. Decide if email/password is even an MVP requirement (Snad call). |
| 23 | 10 | Authenticated home / discovery hero | [page.tsx](src/app/page.tsx) | _TBD_ | ✅ | Same `/` RSC route, `HeroCta` client island branches on auth state (B23). |
| 24 | 11 | Designer search list | [search/page.tsx](src/app/search/page.tsx) | _TBD_ | ✅ | `useDesignerSearch` hook with filters (specialization, city, country, rating, price, "near me"). Pagination dedupe via `args.after` check (closed B9, H9). |
| 25 | 11.1 | Search filter sheet | [search/page.tsx](src/app/search/page.tsx) | _TBD_ | ✅ | shadcn `Sheet` with `aria-label` reading active count (B16); quick-filter chips driven by `is_quick_filter`; close-X buttons keyboard-accessible (B9, H12). |
| 26 | 11.2 | Search empty / error / loading states | [search/page.tsx](src/app/search/page.tsx) | _TBD_ | ✅ | Skeleton loading + "No designers found" empty + "Something went wrong" error state, mutually-exclusive (closed B9). |
| 27 | 12 | Designer profile (public) | [designer/[slug]/page.tsx](src/app/designer/[slug]/page.tsx) + [designer-profile-view.tsx](src/app/designer/[slug]/designer-profile-view.tsx) | _TBD_ | ✅ | SSR (`revalidate: 60`); JSON-LD safe (A5); slug regex + SSR error log (B9); dynamic OG image (B24); portfolio + lightbox `next/image` (B21/B22); PII scrub on public response (BE-NIDLO-PROFILE-04 ✅). |
| 28 | 12.1 | Designer profile — JSON-LD SEO | [designer-json-ld.tsx](src/components/seo/designer-json-ld.tsx) | _TBD_ | ✅ | Closed A5 — `safeJsonForScript()` escapes `<>&` + U+2028/U+2029. |
| 29 | 12.2 | Designer profile — share buttons | [share-buttons.tsx](src/components/shared/share-buttons.tsx) | _TBD_ | ✅ | WhatsApp + native share + copy-link with `aria-label` on icon-only share button (B16). |
| 30 | 12.3 | Designer profile — reviews section | [reviews-section.tsx](src/components/reviews/reviews-section.tsx) + [review-card.tsx](src/components/reviews/review-card.tsx) | _TBD_ | ✅ | Star average, distribution, individual cards with photos using `next/image` (B22) + accessible photo links. |
| 31 | 12.4 | Designer profile — `OrderFromDesigner` CTA | [designer-profile-view.tsx](src/app/designer/[slug]/designer-profile-view.tsx) | _TBD_ | ✅ | Routes to `/blueprint?designer=<slug>`. Hidden when `designerProfile.isAcceptingOrders === false`. |
| 32 | 13 | Dashboard (auth landing) | [dashboard/page.tsx](src/app/dashboard/page.tsx) | _TBD_ | ✅ | Branches on `user.isDesigner` → `DesignerDashboard` vs `ClientDashboard`. `useOrders` only called inside `DesignerDashboard` — H7 audit verified clean (B14). |
| 33 | 13.1 | Client dashboard | [dashboard/page.tsx](src/app/dashboard/page.tsx) | _TBD_ | ✅ | Welcome card + quick actions (Search / Measurements / Orders). No `useOrders` (hoisted to designer-only branch, B14). |
| 34 | 13.2 | Designer dashboard | [dashboard/page.tsx](src/app/dashboard/page.tsx) | _TBD_ | ✅ | Active orders preview, share-link banner, payout stats, ratings preview. |
| 35 | 14 | Commission wizard — Step 1: Garment | [blueprint/step-garment.tsx](src/app/blueprint/step-garment.tsx) | _TBD_ | ✅ | `GarmentTypeCombobox` + occasion picker. |
| 36 | 14.1 | Commission — Step 2: Design details | [blueprint/step-design.tsx](src/app/blueprint/step-design.tsx) | _TBD_ | ✅ | Free-text + voice input. `voice-input.tsx` now reads `navigator.language` with `en-GH` fallback (closed B10, M18). |
| 37 | 14.2 | Commission — Step 3: Reference images | [blueprint/step-reference-images.tsx](src/app/blueprint/step-reference-images.tsx) | _TBD_ | ✅ | ImageKit upload via `reference-image-upload.tsx`; thumbs use `next/image` (B22). |
| 38 | 14.3 | Commission — Step 4: Fabric | [blueprint/step-fabric.tsx](src/app/blueprint/step-fabric.tsx) | _TBD_ | ✅ | `FabricTypeCombobox` + color picker + supplied-by toggle. |
| 39 | 14.4 | Commission — Step 5: Measurements | [blueprint/step-measurements.tsx](src/app/blueprint/step-measurements.tsx) | _TBD_ | ✅ | `MeasurementSelector` — pick saved measurement OR launch manual entry OR launch Fitscan AI. |
| 40 | 14.5 | Commission — Step 6: Budget & timeline | [blueprint/step-budget.tsx](src/app/blueprint/step-budget.tsx) | _TBD_ | ✅ | Budget input (GHS), deadline calendar. |
| 41 | 14.6 | Commission — Step 7: Review + submit | [blueprint/step-review.tsx](src/app/blueprint/step-review.tsx) | _TBD_ | ✅ | Final review screen, calls `createOrder` with friendly categorized errors (B15) + reset on success. |
| 42 | 15 | Manual measurements form | [measurements/manual-form.tsx](src/app/measurements/manual-form.tsx) | _TBD_ | ✅ | 18 measurements with soft cm/inch bounds (B14) + per-garment template picker (B23) — Kaba & Slit / Agbada / Suit / Wedding dress / Shirt / Trousers. |
| 43 | 15.1 | Measurements list | [measurements/page.tsx](src/app/measurements/page.tsx) | _TBD_ | ✅ | Saved measurement profiles with set-default + delete. |
| 44 | 15.2 | AI measurement (Fitscan) flow | [measurements/ai-flow.tsx](src/app/measurements/ai-flow.tsx) | _TBD_ | 🟡 | Camera / upload → preview → confirm with stage hints + elapsed timer + Cancel (B15) and pattern-matched error guidance (no person / multiple people / blurry / low-confidence — B28). Backend Fitscan bridge still pending FS-NIDLO-MEAS-01. |
| 45 | 15.3 | Fitscan consent gate (Anthropic photo forwarding) | [anthropic-consent-dialog.tsx](src/components/measurements/anthropic-consent-dialog.tsx) | _TBD_ | 🟡 | Dialog component scaffolded with shield-check icon, what-we-do bullets, embedded checkbox + privacy-policy link, Accept / Decline (B28). Wiring + `anthropic_consent_at` persistence pending → FS-NIDLO-MEAS-03. |
| 46 | 16 | Internal order creation (designer-side) | [orders/new/page.tsx](src/app/orders/new/page.tsx) | _TBD_ | 🟡 | Designer creates an order on behalf of an in-person client. `useSearchClients` hook → `searchClients` query (audit C9 — backend dep, designer can search any user). |
| 47 | 17 | Orders list | [orders/page.tsx](src/app/orders/page.tsx) | _TBD_ | ✅ | Tabs: All / Active / Completed / Cancelled with per-tab empty states + "Browse Designers" CTA for clients (B11). |
| 48 | 17.1 | Order card | [order-card.tsx](src/components/order/order-card.tsx) | _TBD_ | ✅ | Status badge + thumbnail + designer/client name + price + deadline. |
| 49 | 18 | Order detail | [orders/[id]/page.tsx](src/app/orders/[id]/page.tsx) | _TBD_ | 🟡 | Progress bar, timeline, designer response sheet, cost-book, payment, payout, review prompt. Cancel reason picker + policy explainer (B13); refetch-on-reconnect (B27); next/image swept (B22). N+1 eager-load still pending → BE-NIDLO-ORDER-08. |
| 50 | 18.1 | Order progress bar | [order-progress-bar.tsx](src/components/order/order-progress-bar.tsx) | _TBD_ | ✅ | 6 production stages from `PRODUCTION_STAGES`. |
| 51 | 18.2 | Order timeline | [order-timeline.tsx](src/components/order/order-timeline.tsx) | _TBD_ | ✅ | Per-status events with timestamps; update photos use `next/image` (B22). |
| 52 | 18.3 | Designer response sheet | [designer-response-sheet.tsx](src/components/order/designer-response-sheet.tsx) | _TBD_ | ✅ | Designer accepts / proposes price / declines from order detail. |
| 53 | 18.4 | Cost book panel | [cost-book-panel.tsx](src/components/order/cost-book-panel.tsx) | _TBD_ | ✅ | Designer-only — internal materials list with `aria-label`-ed remove buttons (B16). |
| 54 | 18.5 | Order edit sheet | [order-edit-sheet.tsx](src/components/orders/order-edit-sheet.tsx) | _TBD_ | ✅ | Designer adjusts confirmedPrice, status, internal notes. |
| 55 | 19 | Payment method selection | [orders/[id]/pay/page.tsx](src/app/orders/[id]/pay/page.tsx) | _TBD_ | ✅ | `PaymentMethodSelector` (MTN / Telecel / AT / Card) wrapped in Suspense (closed B7, H8); state machine drives method → otp → momo-pending → callback (B11); never reconstructs money client-side (closed B11, H2). |
| 56 | 19.1 | MoMo Moolre USSD with OTP step | [otp-verification.tsx](src/components/payment/otp-verification.tsx) | _TBD_ | ✅ | OTP entry with countdown timer + attempts-remaining + "session expired" + 30s-cooldown resend (closed B17, H3). |
| 57 | 19.2 | MoMo pending screen (poll) | [momo-pending-screen.tsx](src/components/payment/momo-pending-screen.tsx) | _TBD_ | ✅ | Now wired into `pay/page.tsx` state machine (closed B11, H4). On poll success → redirect to callback; on fail/timeout → return to method selection. |
| 58 | 19.3 | Card via Paystack hosted page | [external-payment-section.tsx](src/components/payment/external-payment-section.tsx) | _TBD_ | ✅ | Redirect to Paystack `authorization_url`; semantic status tokens (B7). |
| 59 | 19.4 | Payment callback (return from Paystack) | [orders/[id]/pay/callback/page.tsx](src/app/orders/[id]/pay/callback/page.tsx) | _TBD_ | ✅ | Verifies `payment.orderId === orderId` (closed A3, FE-PAY-REF). Suspense wrap closed B7 (H8). |
| 60 | 19.5 | Payment result screen | [payment-result.tsx](src/components/payment/payment-result.tsx) | _TBD_ | ✅ | Success / failure states on semantic status tokens (B7). |
| 61 | 19.6 | Payment status badge | [payment-status-badge.tsx](src/components/payment/payment-status-badge.tsx) | _TBD_ | ✅ | Status pill on semantic tokens (`bg-status-warning-soft` etc.) — audit M9 swept (closed B7 / B15). |
| 62 | 20 | Wallet (designer-only) | [wallet/page.tsx](src/app/wallet/page.tsx) | _TBD_ | ✅ | `useAuthGuard({ requireOnboarded: true, requireDesigner: true })` — designer check folded into the guard, no flash of designer-only UI. (closed B14, H7) |
| 63 | 20.1 | Wallet manager (add / remove / set primary) | [wallet-manager.tsx](src/components/wallet/wallet-manager.tsx) | _TBD_ | ✅ | Calls `resolveMomoAccount` → `addWalletAccount`; backend re-resolve enforced (closed audit C3). |
| 64 | 20.2 | Wallet transactions (payout history) | [wallet-transactions.tsx](src/components/wallet/wallet-transactions.tsx) | _TBD_ | ✅ | `myPayouts` query, paginated, filterable by status. |
| 65 | 20.3 | Payout section (per-order) | [payout-section.tsx](src/components/payment/payout-section.tsx) | _TBD_ | ✅ | Designer view with retry button on `failed` payouts; legacy yellow/gray literals swept to semantic tokens (closed B15, PAYOUT-03). |
| 66 | 21 | Messages thread list | [messages/page.tsx](src/app/messages/page.tsx) | _TBD_ | ✅ | `useConversations` + Echo `.message.sent` refresh + refetch-on-reconnect via `useEchoReconnect` (B18). |
| 67 | 21.1 | Conversation list item | [conversation-list-item.tsx](src/components/messages/conversation-list-item.tsx) | _TBD_ | ✅ | Avatar + last message + unread count. |
| 68 | 21.2 | Conversation view | [messages/[conversationId]/page.tsx](src/app/messages/[conversationId]/page.tsx) | _TBD_ | ✅ | `messagesByDate` wrapped in `useMemo([messages])` (closed B12, M8); refetch-on-reconnect via `useEchoReconnect` (closed B18, MSG-17). |
| 69 | 21.3 | Message bubble | [message-bubble.tsx](src/components/messages/message-bubble.tsx) | _TBD_ | ✅ | Text + image + linkify (trailing-punctuation trim closed B12, M16); image converted to `next/image` with view-photo `aria-label` (closed B22). |
| 70 | 21.4 | Date separator | [date-separator.tsx](src/components/messages/date-separator.tsx) | _TBD_ | ✅ | "Today" / "Yesterday" / "12 Apr". |
| 71 | 21.5 | Chat input + image attach | [chat-input.tsx](src/components/messages/chat-input.tsx) | _TBD_ | ✅ | M21 upload-progress overlay landed (closed B13). H10 server-side mime-sniff shipped backend-side (closed B63 / BE-NIDLO-MEDIA-01) — `MediaValidator` magic-byte sniffs every upload mutation. |
| 72 | 21.6 | Message lightbox (image preview) | [message-lightbox.tsx](src/components/messages/message-lightbox.tsx) | _TBD_ | ✅ | Rewritten on shadcn `Dialog` (focus trap, `role="dialog"`, `aria-modal`, return-focus-on-close); `next/image` with sr-only title (closed B12, MSG-18 / H1). |
| 73 | 22 | Notifications list | [notifications/page.tsx](src/app/notifications/page.tsx) | _TBD_ | ✅ | `MY_NOTIFICATIONS` query + filter + mark-read; deep-link to `actionUrl` on click (B13); push-prompt banner gated on `usePushPermission` (B19). |
| 74 | 22.1 | Notification preferences | [notifications/preferences/page.tsx](src/app/notifications/preferences/page.tsx) | _TBD_ | ✅ | Per-category email / push / SMS toggles + quiet-hours mutation. |
| 75 | 23 | Reviews — designer response form | [designer-response-form.tsx](src/components/reviews/designer-response-form.tsx) | _TBD_ | 🔒 | Phase 2 — public reply UI is deferred. Form exists but flow not wired. |
| 76 | 23.1 | Review prompt dialog (post-delivery) | [review-prompt-dialog.tsx](src/components/reviews/review-prompt-dialog.tsx) | _TBD_ | ✅ | Triggers when order hits `delivered` and review window is open. |
| 77 | 23.2 | Review form | [review-form.tsx](src/components/reviews/review-form.tsx) | _TBD_ | ✅ | Star rating + tags + free-text + photos. |
| 78 | 23.3 | Star rating component | [star-rating.tsx](src/components/reviews/star-rating.tsx) | _TBD_ | ✅ | Reused in profile + review-card. |
| 79 | 23.4 | Rating breakdown | [rating-breakdown.tsx](src/components/reviews/rating-breakdown.tsx) | _TBD_ | ✅ | 5-bar distribution + average. |
| 80 | 23.5 | Review photo upload | [review-photo-upload.tsx](src/components/reviews/review-photo-upload.tsx) | _TBD_ | ✅ | ImageKit upload — local blob preview kept as `<img>` (B22). H10 server-side mime-sniff shipped backend-side (closed B63 / BE-NIDLO-MEDIA-01) — `submitReview` photos validated via `MediaValidator`. |
| 81 | 24 | Profile (self-view) | [profile/page.tsx](src/app/profile/page.tsx) | _TBD_ | ✅ | Avatar (`next/image` 64×64, B22) + name + phone + email + location + KYC + edit-profile link with `aria-label` (B16). |
| 82 | 24.1 | Profile edit | [profile/edit/page.tsx](src/app/profile/edit/page.tsx) | _TBD_ | ✅ | Name + location + avatar; dirty-state save tracking (closed B24, PROFILE-04); avatar uploads inline. |
| 83 | 24.2 | Avatar upload | [profile/edit/page.tsx](src/app/profile/edit/page.tsx) | _TBD_ | ✅ | ImageKit upload with translucent `Loader2` overlay + `role="status"` + disabled cursor-wait (closed B15, M21 / PROFILE-06). |
| 84 | 24.3 | Verification documents | [verification-documents.tsx](src/components/shared/verification-documents.tsx) | _TBD_ | ✅ | Upload / delete via ImageKit; status workflow on semantic tokens (B7). |
| 85 | 25 | Mobile bottom nav | [mobile-nav.tsx](src/components/layout/mobile-nav.tsx) | _TBD_ | ✅ | Home / Search / Orders / Messages / Profile. Auth-only — hidden for guests. |
| 86 | 26 | App shell (header + main + mobile-nav) | [app-shell.tsx](src/components/layout/app-shell.tsx) | _TBD_ | ✅ | Wraps every authed page. |
| 87 | 27 | Header (auth state) | [header.tsx](src/components/layout/header.tsx) | _TBD_ | ✅ | Brand link + bell + messages + logout, all icon-only buttons now `aria-label`-ed (bell/messages B12, logout B16); unread-count counts read in label. Logout uses `useLogout()` (closed A2). |
| 88 | 28 | 404 not-found | [not-found.tsx](src/app/not-found.tsx) | _TBD_ | ✅ | Branded fallback. |
| 89 | 29 | Global error boundary | [app/error.tsx](src/app/error.tsx) | _TBD_ | ✅ | Catches uncaught render errors. Per-route overrides for high-stakes routes: payment / onboarding / client onboarding (closed B7). |
| 90 | 30 | Sitemap | [sitemap.ts](src/app/sitemap.ts) | — | ✅ | Generated from `designerSlugs` query, uses centralized `APP_URL` (B7). |
| 91 | 31 | robots.txt | [robots.ts](src/app/robots.ts) | — | ✅ | Allows all; dev-mode disallow. |
| 92 | 32 | Service worker (FCM) | [public/firebase-messaging-sw.js](public/firebase-messaging-sw.js) | — | ✅ | Closed A7, FE-FIREBASE-SW. Reads config from URL query params; safe no-op when missing. Wiring to a real FCM project is FE-NIDLO-PUSH-04. |
| 93 | 33 | PWA manifest | [public/manifest.webmanifest](public/manifest.webmanifest) | — | 🟡 | Brand strings on Nidlo + theme/background colors aligned with `AppSplash` (closed B7 / B26). Maskable PNGs for Android adaptive icons still pending → FE-NIDLO-OPS-02. |
| 94 | 34 | Offline fallback page | [offline/page.tsx](src/app/offline/page.tsx) | _TBD_ | ✅ | Branded WifiOff screen + "Try the home page" CTA; `next-pwa.fallbacks.document` wired (closed B21, OPS-04 / H11). |
| 95 | 35 | Legal: /terms | [terms/page.tsx](src/app/terms/page.tsx) | _TBD_ | ✅ | Effective-date constant + prose-styled body (verified B21, LEGAL-01). |
| 96 | 36 | Legal: /privacy | [privacy/page.tsx](src/app/privacy/page.tsx) | _TBD_ | ✅ | Body covers data sharing, retention, AI/Fitscan note pending FS-NIDLO-MEAS-03 (verified B21, LEGAL-02). |
| 97 | 37 | Legal: /contact | [contact/page.tsx](src/app/contact/page.tsx) | _TBD_ | ✅ | Mailto + form (verified B21, LEGAL-03). |
| 98 | 38 | GDPR cookie banner | — NOT BUILT — | _TBD_ | ⬜ | EU expansion blocker. Decide pre-launch yes/no — Snad call. → FE-NIDLO-LEGAL-05. |
| 99 | 39 | PWA install prompt | [pwa-install-prompt.tsx](src/components/shared/pwa-install-prompt.tsx) | _TBD_ | ✅ | Captures `beforeinstallprompt`, sticky bottom card with Install / X, hides in standalone mode + persists dismissal in localStorage; clears on `appinstalled` (closed B20, OPS-05). |
| 100 | 40 | Sign-out-all-devices | — NOT BUILT — | _TBD_ | ⬜ | Currently only single-session logout. → FE-NIDLO-AUTH-15. |

**100 screens / states**. Every Figma cell is `_TBD_` — Snad to populate as designs land.

---

## Phase 1 — Authentication & onboarding

**Status:** 🟡 — phone OTP flow shipped + audit-fixed, role gating + onboarding wizards working, gaps in forgot-password + sign-out-all-devices + walkthrough.
**Spec screens:** 01, 02, 04–08

### 1.1 — Splash / boot 🟡

**Trigger:** App load (PWA cold start or SPA navigation).
**Current state:** No dedicated splash screen — `AuthProvider` ([auth-provider.tsx](src/providers/auth-provider.tsx)) shows children immediately while `Me` validates in the background. Mobile users see a flash of un-styled content on cold start.

- [x] **FE-NIDLO-AUTH-01** — New [`AppSplash`](src/components/shared/app-splash.tsx) component renders fixed-position over the layout while `_hasHydrated === false`, with a 600ms minimum visible window so a fast hydration doesn't show a one-frame flash. Wordmark + tagline + animated progress bar (`@keyframes splash-bar`). Fades to opacity 0 once hydrated, then unmounts. Mounted in `Providers` immediately under `AuthProvider`. (closed B26)
- [x] **FE-NIDLO-AUTH-02** — Manifest `theme_color: "#6b21a8"` and `background_color: "#faf9f6"` already match the splash chrome — Android cold-start chrome bar + page bg align with the splash background. (verified B26)

### 1.2 — Walkthrough (3-slide carousel) ⬜

**Decision pending (Snad call):** Does the brand want a walkthrough on first install? XLent has it; Nidlo doesn't. Recommend: yes for PWA install + post-install, skip on subsequent launches via `localStorage` flag.

- [x] **FE-NIDLO-AUTH-03** — `/welcome` carousel shipped (closed B107, component coverage closed B118). New [welcome/page.tsx](src/app/welcome/page.tsx) — 3 slides (Find a designer / Perfect fit / Pay your way) with emoji illustration + 1-line body. Skip link in the header → `/auth/phone`; "Get started" CTA on the last slide → `/auth/phone`. Slide indicator dots double as direct-jump buttons (a11y `aria-current`); chevron back/next buttons; the carousel region has `role="region"` + `aria-roledescription="carousel"` + slide-position `aria-label`. 9 Vitest tests pin the slide state machine: initial paint, Skip href, Next traversal swapping CTA on last slide, router.push to `/auth/phone` on Get started, Back disabled on slide 1, Back returns previous slide, indicator-dot direct jump, aria-current tracking, carousel region a11y attributes. Snad decision pending: do we route first-time visitors to `/welcome` automatically (e.g., via a `seen-welcome` localStorage flag), or leave it as an opt-in route? Currently the route exists but no automatic redirect ships.

### 1.3 — Anonymous home preview ✅ (with brand-rebrand gap)

**Trigger:** GET `/` while unauthenticated.
**Current state:** [page.tsx](src/app/page.tsx) renders hero ("Custom Fashion, Connected") + `<HomeDiscovery>`; both paths live in the same component, branched on `_hasHydrated && isAuthenticated`. Anonymous can browse public designer profiles via `/search` and `/designer/[slug]`. Working post-A1–A7.

- [x] FE-NIDLO-AUTH-04 (closed A2) — Hero hides login buttons until `_hasHydrated`.
- [x] FE-NIDLO-AUTH-05 (closed A2, FE-LOGOUT) — Logout consolidated in `useLogout()` clears Apollo store; no PII bleed-through.
- [x] **FE-NIDLO-AUTH-06** — Brand sweep (0.C) — "StitchHub" → "Nidlo" in hero + tagline. All files clean; `grep "StitchHub"` returns 0 hits in user-facing paths. (closed B8)

### 1.4 — Sign-up choice (Phone / Google / Apple) ✅

**Trigger:** "Get Started" CTA → `/auth/phone`.
**Current state:** [auth/phone/page.tsx](src/app/auth/phone/page.tsx) — single screen, no separate "choose method" page. Phone is primary; Google + Apple buttons render inline.

- [x] FE-NIDLO-AUTH-07 — Phone field with dynamic country selector via `GET_COUNTRIES` (active-only filter).
- [x] FE-NIDLO-AUTH-08 — Google OAuth via `@react-oauth/google` + `socialLogin` mutation.
- [x] FE-NIDLO-AUTH-09 — Apple Sign-In gated on `NEXT_PUBLIC_APPLE_CLIENT_ID`.
- [ ] **FE-NIDLO-AUTH-10** — 3-path auth flow tests still pending. Test footprint widened across the audit cycle: linkify (10) + getImageKitThumbnail (7) in B29, onboarding-store persistence (4) in B37, formatPesewas + deadline helpers (12) in B38, payment helpers (13) in B39, CSRF cookie helpers (8) in B40, Apollo `mergeDesignerPage` dedupe (5) in B41, `safeJsonForScript` XSS escapes (9) in B42, `parseStringList` consolidation (11) in B43, `getStatusConfig` order-status mapping (7) in B44, `formatPesewasShort` + `pesewasToGhs` money helpers (5) in B45 — **94 passing tests up from 3.** Auth-flow tests (phone OTP / Google / Apple paths) remain a separate task because they need Apollo + browser-API mocking that grows the test infra.

### 1.5 — Phone OTP request + verify ✅ (closed A1, FE-CSRF + closed A2, FE-PHONE-URL)

**Trigger:** "Send OTP" → `requestOtp` mutation → `sessionStorage.setItem("nidlo:auth:pendingPhone", phone)` → `/auth/verify`.
**Current state:** [auth/phone/page.tsx:209-211](src/app/auth/phone/page.tsx#L209) and [auth/verify/page.tsx](src/app/auth/verify/page.tsx). Phone moved out of URL query (closed A2). Suspense-wrapped (audit H8 already addressed for this route).

- [x] FE-NIDLO-AUTH-11 (closed A2, FE-PHONE-URL) — Phone via `sessionStorage`, never URL.
- [x] FE-NIDLO-AUTH-12 (closed A1, FE-CSRF) — `csrfLink` warmed on `requestOtp` and `verifyOtp` mutations.
- [x] **FE-NIDLO-AUTH-13** — `RetryLink` in [client.ts](src/lib/graphql/client.ts) detects `ServerError.statusCode === 419`, calls `resetCsrfState()` + `ensureCsrfCookie()`, retries once with refreshed token. (closed B10)

### 1.6 — Google OAuth ✅

- [x] FE-NIDLO-AUTH-14 — Calls `socialLogin(provider: "google")` mutation. → BE-NIDLO-AUTH-04.

### 1.7 — Apple Sign-In ✅

- [x] FE-NIDLO-AUTH-15 — AppleID JS SDK loaded on demand. Calls `socialLogin(provider: "apple")`. → BE-NIDLO-AUTH-04.

### 1.8 — Role selection 🟡 (audit H6)

**Trigger:** First-time user post-OTP → redirected by `useGuestGuard` to `/auth/role`.
**Current state:** [auth/role/page.tsx](src/app/auth/role/page.tsx) shows 3 tiles: "I want clothes made" / "I'm a designer" / "I run a workshop" (disabled, Phase 2). "Designer" calls `becomeDesigner` mutation → creates `designer_profiles` row → redirects `/onboarding`. "Client" calls `completeOnboarding` directly → `/dashboard`.

- [x] FE-NIDLO-AUTH-16 — `becomeDesigner` mutation wired.
- [x] FE-NIDLO-AUTH-17 — Organization tile disabled (Phase 2).
- [x] **FE-NIDLO-AUTH-18** — `auth/role/page.tsx` consolidated behind `useAuthGuard()` (closed B8, fully consolidated B96). Dropped the redundant `useEffect` + ad-hoc `isLoading` skeleton check. New `redirectOnboardedTo` option on [useAuthGuard](src/lib/hooks/use-auth-guard.ts) handles the bounce-already-onboarded path; the page now collapses to a single `useAuthGuard({ redirectOnboardedTo: '/dashboard' })` call. Audit H6 closed end-to-end.

### 1.9 — Designer onboarding wizard 🟡

**Trigger:** Post-`becomeDesigner` → `/onboarding`.
**Current state:** [onboarding/page.tsx](src/app/onboarding/page.tsx) wraps 4 step files: basic-info, specializations, pricing, portfolio. Combined into 8 logical sub-steps inside the portfolio step (LocationPicker, ImageKit upload, terms, verification docs, etc.). `useOnboardingStore` Zustand persist (gap M24 — no TTL).

- [x] FE-NIDLO-ONBD-01 — Step 1: display name, bio, years experience, gender. → BE-NIDLO-PROFILE-01.
- [x] FE-NIDLO-ONBD-02 — Step 2: specializations multi-select + custom add via `CREATE_SPECIALIZATION`. → BE-NIDLO-LOOKUP-01.
- [x] FE-NIDLO-ONBD-03 — Step 3: pricing min/max in GHS, converted to pesewas at submit.
- [x] FE-NIDLO-ONBD-04 — Step 4: portfolio images via ImageKit (`useFileUpload` hook).
- [x] FE-NIDLO-ONBD-05 — `LocationPicker` with Google Maps autocomplete + map + reverse geocode. → uses `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (closed A7, FE-MAPS-KEY — gitignored verified).
- [x] FE-NIDLO-ONBD-06 — Terms acceptance checkbox.
- [x] FE-NIDLO-ONBD-07 — Verification documents upload + delete via [verification-documents.tsx](src/components/shared/verification-documents.tsx).
- [x] FE-NIDLO-ONBD-08 — `completeOnboarding` mutation sets `onboarded_at`, redirects `/dashboard`.
- [x] **FE-NIDLO-ONBD-09** — `reset()` called after `completeOnboarding` succeeds in `onboarding/page.tsx`. Audit M24 closed. (pre-existing)
- [x] **FE-NIDLO-ONBD-10** — New [`onboarding.test.ts`](src/lib/stores/onboarding.test.ts) verifies the resume-mid-wizard contract: writing step + fields + arrays produces the expected `localStorage["stitchhub-onboarding"]` and `localStorage["stitchhub-client-onboarding"]` payloads (which is what a fresh page-load would re-hydrate from). `reset()` flushes back to initial. Designer + client stores both covered. (closed B37)
- [x] **FE-NIDLO-ONBD-11** — Portfolio upload now tracks failed files in state and renders a persistent "N upload(s) failed" list with file name, server reason, retry button (replays `addImage` for that file), and dismiss X. Replaces the transient toast that disappeared in 4 seconds. Type/size guards push the same failure UI for consistency. (closed B20)

### 1.10 — Client onboarding wizard 🟡

**Trigger:** Post-OTP, role-select "client" → `completeClientOnboarding` mutation → `/onboarding/client`.
**Current state:** [onboarding/client/page.tsx](src/app/onboarding/client/page.tsx) — 4 explicit steps: basic-info, interests, location, finish. `useClientOnboardingStore` (same M24 gap).

- [x] FE-NIDLO-ONBD-12 — Step 1: name fields. → BE-NIDLO-PROFILE-02.
- [x] FE-NIDLO-ONBD-13 — Step 2: 28 fashion interests across 4 categories. → BE-NIDLO-LOOKUP-02.
- [x] FE-NIDLO-ONBD-14 — Step 3: `LocationPicker`.
- [x] FE-NIDLO-ONBD-15 — Step 4: referral code + terms. Calls `completeClientOnboarding`.
- [x] **FE-NIDLO-ONBD-16** — `reset()` called after `completeClientOnboarding` succeeds in `onboarding/client/page.tsx`. (pre-existing)
- [x] **FE-NIDLO-ONBD-17** — Brand sweep — copy strings. All clean. (closed B8)

### 1.11 — Forgot password / reset ⬜ (Snad decision)

**Pending decision:** Phone OTP IS the auth — if a user loses access to their phone number, they need account recovery, not a "password reset". Email-attached accounts (rare in beta) have no password flow today.

- [ ] **FE-NIDLO-AUTH-19** — Decision: do we even need this for beta? If yes: build `/auth/recover` flow that takes alternate phone / email / KYC selfie, kicks off admin review (manual in beta). → AD-NIDLO-RECOVER-01.

### 1.12 — Multi-tab session sharing ✅

- [x] FE-NIDLO-AUTH-20 — Sanctum cookie is session-shared across tabs by browser default. `BroadcastChannel` for cross-tab notification dedupe is a tech-debt item (audit M13 — `use-push-notifications.ts`).

### 1.13 — Sign out ✅ (closed A2, FE-LOGOUT)

- [x] FE-NIDLO-AUTH-21 — `useLogout()` consolidates `apolloClient.clearStore()` + `resetCsrfState()` + `clearAuth()` + redirect.

### 1.14 — Sign out all devices ⬜

- [x] **FE-NIDLO-AUTH-22** — Settings page now has a "Sign out of all devices" button that opens a shadcn `Dialog` confirm → `useSignOutAllDevices()` hook → backend `signOutAllDevices` mutation (BE-NIDLO-AUTH-04 ✅) revokes all tokens + deletes every session row → local `clearStore` + redirect. (closed B61)

**Backend deps for Phase 1:** BE-NIDLO-AUTH-01 (`requestOtp`), BE-NIDLO-AUTH-02 (`verifyOtp`), BE-NIDLO-AUTH-03 (`socialLogin`), BE-NIDLO-AUTH-04 (Google + Apple verification), BE-NIDLO-AUTH-05 (logout-all), BE-NIDLO-PROFILE-01 (`becomeDesigner`), BE-NIDLO-PROFILE-02 (`completeOnboarding` + `completeClientOnboarding`), BE-NIDLO-LOOKUP-01 (`createSpecialization`), BE-NIDLO-LOOKUP-02 (`fashionInterests`).

---

## Phase 2 — Discovery & marketplace

**Status:** 🟡 — search + designer profiles working post-A5; missing public homepage polish, designer favorites, legal pages.
**Spec screens:** 03, 11, 12, 35–38

### 2.1 — Public homepage (anonymous + authenticated) 🟡

**Trigger:** GET `/`.
**Current state:** [page.tsx](src/app/page.tsx) — single component, branches on `_hasHydrated && isAuthenticated`. Anonymous sees hero + `<HomeDiscovery>` (recommended designers, near-you, by-specialization). Authenticated sees same hero with "My Dashboard" CTA + same discovery.

- [x] FE-NIDLO-SEARCH-01 — Hero + dual CTA (Get Started / Browse Designers).
- [x] FE-NIDLO-SEARCH-02 — `<HomeDiscovery>` ([home-discovery.tsx](src/components/shared/home-discovery.tsx)) — public scroll sections.
- [x] **FE-NIDLO-SEARCH-03** — Audit M3 — `app/page.tsx` is now a Server Component; the only client island is the new [`HeroCta`](src/components/shared/hero-cta.tsx) that branches on auth state. Static hero copy + tagline + heading + body now ship as plain HTML. (closed B23)
- [x] **FE-NIDLO-SEARCH-04** — Nidlo tagline ("Where every stitch begins.") added above hero heading. (closed B9)
- [ ] **FE-NIDLO-SEARCH-05** — Trust strip — "X designers in Y cities" derived from `BE-NIDLO-STATS-01`.

### 2.2 — Designer search list 🟡

**Trigger:** `/search` (Browse Designers CTA, mobile-nav, header link).
**Current state:** [search/page.tsx](src/app/search/page.tsx) — `useDesignerSearch` hook → `designers(input)` paginated query. Filters: search text, specialization, city, country, rating min, price min/max, "near me" toggle.

- [x] FE-NIDLO-SEARCH-06 — Filter UI: text search + filter sheet (mobile) / inline filter bar (desktop).
- [x] FE-NIDLO-SEARCH-07 — Quick-filter chips driven by `is_quick_filter`.
- [x] FE-NIDLO-SEARCH-08 — Pagination via `paginatorInfo`.
- [x] FE-NIDLO-SEARCH-09 — `DesignerCard` ([designer-card.tsx](src/components/shared/designer-card.tsx)) — avatar + name + specializations + rating + city.
- [x] **FE-NIDLO-SEARCH-10** — Audit H9 — `merge` now checks `args.after`; no cursor = page 1 = reset instead of concat. (closed B9)
- [x] **FE-NIDLO-SEARCH-11** — Audit H12 — filter chip `<X>` icons replaced with `<button aria-label="...">` + focus ring. (closed B9)
- [x] **FE-NIDLO-SEARCH-12** — Error state added above empty state; empty state now gated on `!error`. (closed B9)
- [x] **FE-NIDLO-SEARCH-13** — `fetchPolicy: cache-first` applied globally in hooks + call sites. (closed B8, M12)

### 2.3 — Designer detail (public) 🟡 (closed A5, FE-XSS)

**Trigger:** Tap on `DesignerCard` → `/designer/[slug]`.
**Current state:** [designer/[slug]/page.tsx](src/app/designer/[slug]/page.tsx) (RSC, `revalidate: 60`) → [designer-profile-view.tsx](src/app/designer/[slug]/designer-profile-view.tsx) (client). JSON-LD output safe (closed A5, FE-XSS). `OrderFromDesigner` CTA hidden when `isAcceptingOrders === false` (frontend gate; backend enforcement is BE-NIDLO-ORDER-04 tech-debt).

- [x] FE-NIDLO-DESIGNER-01 — SSR fetch with `next: { revalidate: 60 }`.
- [x] FE-NIDLO-DESIGNER-02 (closed A5, FE-XSS) — JSON-LD escapes `<>&` + U+2028/U+2029.
- [x] FE-NIDLO-DESIGNER-03 — Hero with avatar + display name + specializations + rating average + city.
- [x] FE-NIDLO-DESIGNER-04 — Portfolio gallery.
- [x] FE-NIDLO-DESIGNER-05 — Reviews section.
- [x] FE-NIDLO-DESIGNER-06 — `OrderFromDesigner` CTA → `/blueprint?designer=<slug>`.
- [x] **FE-NIDLO-DESIGNER-07** — SSR fetch failure now logs to `console.error` (Sentry hook deferred until @sentry/nextjs is wired). (closed B9)
- [x] **FE-NIDLO-DESIGNER-08** — Slug validated against `/^[a-z0-9-]+$/` before issuing GraphQL; invalid slugs return null → `notFound()`. (closed B9)
- [x] **FE-NIDLO-DESIGNER-09** — Designer profile portfolio + lightbox use `next/image` with `fill` + responsive `sizes`. (closed B21, paired OPS-18 closed B22)
- [x] **FE-NIDLO-DESIGNER-10** — Backend `UserPrivateField` resolver gates `phone` / `email` / `locationLat` / `locationLng` on public queries. (verified B48 against backend/TASKS.md — BE-NIDLO-PROFILE-04 ✅)

### 2.4 — Search filters 🟡

Already covered in 2.2 — flagged separately to track Snad's filter UX call.

- [ ] **FE-NIDLO-SEARCH-14** — Confirm filter taxonomy with Snad (specialization, city, country, rating, price, "available now", "verified only").

### 2.5 — Quick-filter chips ✅

- [x] FE-NIDLO-SEARCH-15 — Renders `is_quick_filter === true` specializations as horizontal scroll chips.

### 2.6 — Specialization browse pages ⬜

- [ ] **FE-NIDLO-SEARCH-16** — `/specialization/[slug]` route — pre-filtered designer list with SEO-friendly URL. → BE-NIDLO-LOOKUP-03 (`specializationBySlug`).

### 2.7 — City browse pages ⬜

- [ ] **FE-NIDLO-SEARCH-17** — `/city/[slug]` route — same pattern as specialization. → BE-NIDLO-LOOKUP-04.

### 2.8 — Designer favorites 🔒

Phase 2 deferred — clients can't bookmark designers in beta. Snad call when discovery patterns stabilize.

### 2.9 — SEO: JSON-LD + sitemap + Open Graph 🟡

- [x] FE-NIDLO-SEARCH-18 (closed A5, FE-XSS) — JSON-LD safe.
- [x] FE-NIDLO-SEARCH-19 — Sitemap at [sitemap.ts](src/app/sitemap.ts) — generated from `designerSlugs` query.
- [x] FE-NIDLO-SEARCH-20 — robots.txt at [robots.ts](src/app/robots.ts).
- [x] **FE-NIDLO-SEARCH-21** — New [`opengraph-image.tsx`](src/app/designer/[slug]/opengraph-image.tsx) edge-runtime route generates a 1200×630 PNG per designer using `next/og`'s `ImageResponse`: portfolio image as background with a dark gradient overlay, "NIDLO" brand mark, display name (76px bold), specialization chips, and rating + city footer. Replaces the previous static `getOgImage()` builder in `page.tsx` — Next now auto-populates `openGraph.images`/`twitter.images` from the file convention. (closed B24)
- [x] **FE-NIDLO-SEARCH-22** — `alternates.canonical` + `twitter` block (`summary_large_image`) wired in [designer/[slug]/page.tsx generateMetadata](src/app/designer/[slug]/page.tsx). (pre-existing, verified B10)

### 2.10 — Legal pages: /terms, /privacy, /contact ⬜ (pre-launch blocker)

- [x] **FE-NIDLO-LEGAL-01** — `/terms` page exists ([terms/page.tsx](src/app/terms/page.tsx), 92 lines, prose styles, effective-date constant). (verified B21)
- [x] **FE-NIDLO-LEGAL-02** — `/privacy` page exists ([privacy/page.tsx](src/app/privacy/page.tsx), 119 lines). Anthropic / Fitscan note pending FS-NIDLO-MEAS-03 consent flow. (verified B21)
- [x] **FE-NIDLO-LEGAL-03** — `/contact` page exists ([contact/page.tsx](src/app/contact/page.tsx), 76 lines). (verified B21)
- [x] **FE-NIDLO-LEGAL-04** — Centralized in [lib/config.ts](src/lib/config.ts); imported by layout / sitemap / robots / json-ld. (closed B7)
- [ ] **FE-NIDLO-LEGAL-05** — GDPR cookie banner — Snad decision per principles.

**Backend deps for Phase 2:** BE-NIDLO-DESIGNER-01 (`designers(input)`), BE-NIDLO-DESIGNER-02 (`designer(slug)`), BE-NIDLO-DESIGNER-03 (`designerSlugs`), BE-NIDLO-LOOKUP-03 (`specializationBySlug`), BE-NIDLO-LOOKUP-04 (`cityBySlug`), BE-NIDLO-PROFILE-04 (PII scrub on public profile).

---

## Phase 3 — Commission & measurement

**Status:** 🟡 — 7-step blueprint wizard working; Fitscan integration partially wired; consent gate missing.
**Spec screens:** 14, 15, 18

### 3.1 — Blueprint commission wizard 🟡

**Trigger:** "Order from this designer" CTA → `/blueprint?designer=<slug>`.
**Current state:** [blueprint/page.tsx](src/app/blueprint/page.tsx) Suspense-wrapped, 7 steps:

- [x] FE-NIDLO-COMM-01 — Step 1 (Garment & Occasion) — [step-garment.tsx](src/app/blueprint/step-garment.tsx). `GarmentTypeCombobox` from `useBlueprintOptions`.
- [x] FE-NIDLO-COMM-02 — Step 2 (Design Details) — [step-design.tsx](src/app/blueprint/step-design.tsx). Free-text + voice input (audit M18 — `en-GH` hardcoded).
- [x] FE-NIDLO-COMM-03 — Step 3 (Reference Images) — [step-reference-images.tsx](src/app/blueprint/step-reference-images.tsx). ImageKit upload.
- [x] FE-NIDLO-COMM-04 — Step 4 (Fabric) — [step-fabric.tsx](src/app/blueprint/step-fabric.tsx). Combobox + color + supplied-by.
- [x] FE-NIDLO-COMM-05 — Step 5 (Measurements) — [step-measurements.tsx](src/app/blueprint/step-measurements.tsx). `MeasurementSelector` integrates 3.2 + 3.3.
- [x] FE-NIDLO-COMM-06 — Step 6 (Budget & Timeline) — [step-budget.tsx](src/app/blueprint/step-budget.tsx). GHS input → pesewas at submit.
- [x] FE-NIDLO-COMM-07 — Step 7 (Review + Submit) — [step-review.tsx](src/app/blueprint/step-review.tsx). Calls `createOrder`.
- [x] **FE-NIDLO-COMM-08** — `reset()` already called in [blueprint/page.tsx:157](src/app/blueprint/page.tsx#L157) after `createOrder` succeeds. (pre-existing)
- [x] **FE-NIDLO-COMM-09** — Audit M18 — voice input now uses `navigator.language || "en-GH"` in [voice-input.tsx](src/components/orders/voice-input.tsx). (closed B10)
- [x] **FE-NIDLO-COMM-10** — `blueprint/page.tsx` createOrder catch now categorizes errors (designer-not-accepting → "This designer isn't accepting new orders right now…", network/fetch → connection prompt, validation → review-each-step prompt) before falling back to a generic friendly toast. (closed B15)

### 3.2 — Manual measurement entry 🟡

**Trigger:** From `/measurements` "+ New" or from blueprint wizard step 5.
**Current state:** [measurements/manual-form.tsx](src/app/measurements/manual-form.tsx) — 12+ body measurements per garment-type template.

- [x] FE-NIDLO-MEAS-01 — Form with cm inputs.
- [x] FE-NIDLO-MEAS-02 — `useCreateMeasurement` / `useUpdateMeasurement` / `useDeleteMeasurement` / `useSetDefaultMeasurement` hooks.
- [x] **FE-NIDLO-MEAS-03** — `ManualForm` accepts `initialTemplate` and shows a "Garment template" `Select`. Templates: All, Kaba & Slit, Agbada, Suit, Wedding dress, Shirt, Trousers — each maps to a curated subset of FIELD_LABELS so the form only renders what matters for that garment. Sections with no matching fields are hidden. Switching template doesn't clear data — values persist if you toggle back. (closed B23)
- [x] **FE-NIDLO-MEAS-04** — Soft-bounds validation in `manual-form.tsx`: per-field cm range table covering bust/waist/hips/shoulder/chest/neck/arm_length/bicep/wrist/thigh/inseam/outseam/knee/calf/ankle/height/back_length/front_length. Out-of-range values get a warning border + "Outside typical range" inline message; values are unit-aware (converts inches → cm via 2.54). Non-blocking — children's garments / outliers can still save. (closed B14)

### 3.3 — Fitscan AI scan flow 🟡

**Trigger:** From blueprint wizard step 5, "Use AI scan" → [measurements/ai-flow.tsx](src/app/measurements/ai-flow.tsx).
**Current state:** Camera / upload → preview → confirm. Backend bridges to Fitscan over HTTP.

- [x] FE-NIDLO-MEAS-05 — Camera capture + file upload (front + side photos).
- [x] **FE-NIDLO-MEAS-06** — Height-cm input already in `ai-flow.tsx` upload step (line 142) with min/max bounds + accuracy hint; passed as `heightCm` mutation variable when present. (verified B17)
- [x] **FE-NIDLO-MEAS-07** — `ai-flow.tsx` extract catch now inspects the error message and renders specific guidance: no-person-detected ("Try one with your full body in frame"), multiple-people ("Use a photo of just yourself"), low-resolution / blurry / low-confidence / network — each with concrete next steps. Toast duration bumped to 6 s so the longer copy stays readable. Falls back to the generic message only if no pattern matches. (closed B28; full FS error taxonomy still in FS-NIDLO-MEAS-04)
- [x] **FE-NIDLO-MEAS-08** — Processing screen now shows stage hints ("Detecting body landmarks…" → "Computing measurements…" → "Refining results…" → "Almost there…"), elapsed-seconds counter, "usually takes 5–15 seconds" copy, and a Cancel button that returns to the upload step (any in-flight result is dropped via `cancelledRef`). (closed B15)

### 3.4 — Fitscan consent gate (Anthropic photo forwarding) ⬜

**Trigger:** Before forwarding the front photo to Anthropic for style classification (planned Phase 2 of Fitscan).

- [x] **FE-NIDLO-MEAS-09** — New [`AnthropicConsentDialog`](src/components/measurements/anthropic-consent-dialog.tsx) component scaffolded: shadcn `Dialog` with shield-check icon, what-we-do bullet list, embedded checkbox + privacy-policy link, and Accept / Decline actions. The acceptance handler is owned by the caller (it'll call the backend mutation that persists `anthropic_consent_at` once FS-NIDLO-MEAS-03 lands). Component reusable from style-classification flow when wired. (closed B28; full wiring + persistence pending FS-NIDLO-MEAS-03)

### 3.5 — Order initiation ✅

- [x] FE-NIDLO-COMM-11 — `createOrder` mutation in [order.ts](src/lib/graphql/mutations/order.ts). Designer slug + blueprint payload + measurement_id + budget + deadline.

### 3.6 — Designer price confirmation 🟡

**Trigger:** Order detail (designer side) → "Confirm price".
**Current state:** [designer-response-sheet.tsx](src/components/order/designer-response-sheet.tsx) — designer accepts / proposes new price / declines.

- [x] FE-NIDLO-ORDER-01 — Three-way action sheet.
- [x] **FE-NIDLO-ORDER-02** — Pending-order response countdown shipped (closed B102, component coverage closed B117). New [ResponseCountdown](src/components/order/response-countdown.tsx) component renders a chip on `/orders/[id]` when status is `pending` — "Designer has 23h left" → "Designer has 45m left" → "Response window expired" with severity-tone color (muted → warning → error). Re-renders every minute via `setInterval` so the chip stays accurate without parent refetches. `ORDER_RESPONSE_WINDOW_HOURS` constant + 6 Vitest helper tests (B102) + 8 component tests (B117) — covers initial paint, color escalation across muted/warning/error, expired sentinel, tick-driven update, `aria-live="polite"` + `role="status"`, interval cleanup on unmount, and custom `windowHours` override. Pairs with → BE-NIDLO-ORDER-09 (auto-cancel on timeout, separate sprint).
- [ ] **FE-NIDLO-ORDER-03** — Notify backend cancel-on-timeout. → BE-NIDLO-ORDER-09.

### 3.7 — Client accepts / rejects price 🟡

**Trigger:** Designer proposes new price → client receives notification + sees "Accept / Reject" actions on order detail.
**Current state:** Wired in [orders/[id]/page.tsx](src/app/orders/[id]/page.tsx) via `confirmOrder` / `cancelOrder` mutations.

- [x] FE-NIDLO-ORDER-04 — Accept / reject buttons.
- [ ] **FE-NIDLO-ORDER-05** — Counter-offer (client → designer back-and-forth) — Snad decision: in scope for beta or Phase 2?

### 3.8 — Order draft save / resume ⬜

- [ ] **FE-NIDLO-ORDER-06** — Save partially-completed blueprint as draft. → BE-NIDLO-ORDER-10.

### 3.9 — Reorder (clone existing order) ⬜

- [ ] **FE-NIDLO-ORDER-07** — "Order again" CTA on completed order detail. Pre-fills wizard. → BE-NIDLO-ORDER-11.

**Backend deps:** BE-NIDLO-COMM-01 (`createOrder`), BE-NIDLO-ORDER-04 (`isAcceptingOrders` server enforcement), BE-NIDLO-ORDER-09 (response timeout), BE-NIDLO-ORDER-10 (drafts), BE-NIDLO-ORDER-11 (clone).
**Fitscan deps:** FS-NIDLO-MEAS-01 (`/measure/avatar` working — FS C6 broken), FS-NIDLO-MEAS-02 (mesh height rescaling — FS H13 broken), FS-NIDLO-MEAS-03 (Anthropic consent flag), FS-NIDLO-MEAS-04 (error taxonomy + low-confidence response).

---

## Phase 4 — Production & tracking

**Status:** 🟡 — order list + detail working with Reverb realtime; eager-load gap; cancellation flow basic.
**Spec screens:** 17, 18, 25 (mobile nav)

### 4.1 — Order list 🟡

**Trigger:** Mobile-nav "Orders" tile or `/orders` direct.
**Current state:** [orders/page.tsx](src/app/orders/page.tsx) — `useOrders` hook, paginated, tabs (All / Active / Completed / Cancelled). Each tab a separate query.

- [x] FE-NIDLO-ORDER-08 — Tab UI with status filter.
- [x] FE-NIDLO-ORDER-09 — `OrderCard` ([order-card.tsx](src/components/order/order-card.tsx)) renders status + thumbnail + price + deadline.
- [x] **FE-NIDLO-ORDER-10** — Empty state per tab with "Browse Designers" CTA for client users on `all` / `active` tabs. (closed B11)
- [x] **FE-NIDLO-ORDER-11** — `myOrders` eager-load now pinned by regression test (closed B81). Backend [MyOrders](../backend/app/GraphQL/Queries/MyOrders.php) eager-loads `payments` + `externalPayments`; new Pest test in [OrderQueriesTest](../backend/tests/Feature/Order/OrderQueriesTest.php) uses `DB::enableQueryLog()` to assert ≤1 SELECT per relation across 5 orders. Audit C8 N+1 closed end-to-end. → BE-NIDLO-SEARCH-08.

### 4.2 — Order detail 🟡

**Trigger:** Tap `OrderCard` → `/orders/[id]`.
**Current state:** [orders/[id]/page.tsx](src/app/orders/[id]/page.tsx) — comprehensive view: progress bar, timeline, designer response sheet (designer-side), cost-book panel, payment section, payout section, review prompt.

- [x] FE-NIDLO-ORDER-12 — All major sub-components rendered conditionally based on role (`isClient` vs designer).
- [x] FE-NIDLO-ORDER-13 — Payment + payout sections render based on order status.
- [x] **FE-NIDLO-ORDER-14** — `order(id:)` eager-load now pinned by regression test (closed B81). [OrderDetail](../backend/app/GraphQL/Queries/OrderDetail.php) eager-loads `payments` + `externalPayments`; the same N+1 regression suite covers the single-order path. → BE-NIDLO-SEARCH-08.
- [x] **FE-NIDLO-ORDER-15** — Audit cleared: zero `optimisticResponse` calls in `src/`. `confirmDelivery`, `updateOrderStatus`, `confirmOrder` are all fire-and-refetch. No rollback liability to audit. (closed B26)

### 4.3 — Status update push (Reverb) 🟡

**Trigger:** Designer marks ready / delivered → backend fires `OrderStatusChanged` event on `private-order.{orderId}` channel.
**Current state:** [realtime-provider.tsx](src/providers/realtime-provider.tsx) listens on `user.{userId}` channel. Order-specific subscription is per-page (refetch on event).

- [x] FE-NIDLO-ORDER-16 — Echo subscriber on order detail page.
- [x] **FE-NIDLO-ORDER-17** — Order detail page now calls `useEchoReconnect(echo, refetch)` so any status / payment / payout events that fired while the WebSocket was down don't leave the screen stale. (closed B27, paired 0.B.15)
- [x] **FE-NIDLO-ORDER-18** — UUID broadcast verified safe (closed B94). [routes/channels.php#L9](../backend/routes/channels.php) declares the user channel as `Broadcast::channel('App.Models.User.{id}', function ($user, string $id) { return $user->id === $id; })` — the param is explicitly `string` so a UUID lands as a string compared to `users.id` (also a UUID string). Audit C2 stale; safe-by-design. The Spatie roles work (BE-NIDLO-AUTH-06) is a separate concern.

### 4.4 — Materials list (designer-side) 🟡

- [x] FE-NIDLO-ORDER-19 — `CostBookPanel` ([cost-book-panel.tsx](src/components/order/cost-book-panel.tsx)) — designer's internal materials.

### 4.5 — Mark ready / delivered 🟡

- [x] FE-NIDLO-ORDER-20 — Designer "Mark ready" → `updateOrderStatus(status: ready)`.
- [x] FE-NIDLO-ORDER-21 — Client "Confirm delivery" → `confirmDelivery`.
- [ ] **FE-NIDLO-ORDER-22** — Photo upload on "Mark ready" (proof-of-completion). → BE-NIDLO-ORDER-12.

### 4.6 — Order cancellation 🟡

- [x] FE-NIDLO-ORDER-23 — `cancelOrder` mutation wired.
- [x] **FE-NIDLO-ORDER-24** — Reason picker (`Select` with 6 canonical categories: changed_mind, found_another_designer, designer_unresponsive, price_too_high, timeline_too_long, other) + free-text notes; "other" requires notes. Composed reason sent to backend as `<category>: <notes>`. (closed B13)
- [x] **FE-NIDLO-ORDER-25** — Inline policy text on the cancel card explaining refund timing depends on production stage and that designers keep already-incurred fabric/material costs. (closed B13; modal upgrade pending BE-NIDLO-PAY-08)

**Backend deps:** BE-NIDLO-ORDER-08 (eager-load `myOrders` + `orderDetail` to close audit C8 N+1), BE-NIDLO-AUTH-06 (UUID broadcast channel — audit C2), BE-NIDLO-ORDER-12 (proof-of-completion uploads), BE-NIDLO-PAY-08 (cancellation refund policy).

---

## Phase 5 — Payments

**Status:** 🟡 — multi-gateway flow shipped, callback verifier closed (A3); polling + Suspense gaps.
**Spec screens:** 19

### 5.1 — Two-stage payment (deposit / balance) ✅

**Trigger:** Order detail "Pay deposit" CTA → `/orders/[id]/pay?type=deposit`. Backend `PaymentService::calculateDeposit` returns the amount.

- [x] FE-NIDLO-PAY-01 — `useInitiatePayment` hook + URL `?type=deposit|balance`.
- [x] **FE-NIDLO-PAY-02** — Audit H2 — `pay/page.tsx` now renders `Skeleton` while `paymentSummary === undefined`; no client-side fallback math (closed B11).

### 5.2 — Method selection screen 🟡

**Trigger:** GET `/orders/[id]/pay`.
**Current state:** [pay/page.tsx](src/app/orders/[id]/pay/page.tsx) renders `PaymentMethodSelector`. **Audit H8** — `useSearchParams()` not Suspense-wrapped (Next 16 build break).

- [x] FE-NIDLO-PAY-03 — `PaymentMethodSelector` ([payment-method-selector.tsx](src/components/payment/payment-method-selector.tsx)) — MTN / Telecel / AT / Card.
- [x] **FE-NIDLO-PAY-04** — `pay/page.tsx` wraps body in `Suspense` (closed B7, H8).
- [x] **FE-NIDLO-PAY-05** — `window.location.origin` only reads inside click handlers (`handleMethodSelect`, `handleOtpSubmit`, `MomoPendingScreen.onSuccess`); these can only fire post-hydration. No SSR risk. (closed B11)

### 5.3 — MoMo Moolre USSD with OTP step 🟡

**Trigger:** User selects MoMo method → `initiatePayment(method: momo, ...)` → backend returns `{requiresOtp: true, sessionId}` → frontend shows OTP entry.

- [x] FE-NIDLO-PAY-06 — `OtpVerification` ([otp-verification.tsx](src/components/payment/otp-verification.tsx)) — accepts 4–6 digit OTP.
- [x] **FE-NIDLO-PAY-07** — Audit H3 — `OtpVerification` rewritten with: 5-min countdown (mm:ss + clock icon), `attemptsRemaining` prop, "Session expired" state that swaps the verify CTA for a "Send a new code" button, and an underlined "Didn't get the code? Resend" affordance gated by a 30-second cooldown so users can't spam the SMS endpoint. Pay page wires `onResend` to a fresh `handleMethodSelect(pendingMethod, pendingPhone)` (Moolre re-init reissues the OTP). (closed B17)
- [x] **FE-NIDLO-PAY-08** — `MomoPendingScreen` + `OtpVerification` now wired into [pay/page.tsx](src/app/orders/[id]/pay/page.tsx) via `step` state machine. Polling success redirects to callback; failed/timeout returns to method selection. (closed B11, H4)

### 5.4 — Card via Paystack hosted page 🟡

- [x] FE-NIDLO-PAY-09 — `ExternalPaymentSection` ([external-payment-section.tsx](src/components/payment/external-payment-section.tsx)) — redirect to `authorization_url`.
- [x] **FE-NIDLO-PAY-10** — Audit M9 — semantic status tokens (`bg-status-warning-soft` etc.) replace literal `bg-yellow-*`/`bg-blue-*` across payment components (closed B7).

### 5.5 — Payment callback ✅ (closed A3, FE-PAY-REF)

- [x] FE-NIDLO-PAY-11 (closed A3, FE-PAY-REF) — [pay/callback/page.tsx](src/app/orders/[id]/pay/callback/page.tsx) verifies `payment.orderId === orderId` from URL path.
- [x] **FE-NIDLO-PAY-12** — `pay/callback/page.tsx` wrapped in `Suspense` (closed B7, H8).

### 5.6 — Receipt / confirmation 🟡

- [x] FE-NIDLO-PAY-13 — `PaymentResult` ([payment-result.tsx](src/components/payment/payment-result.tsx)) — success / failure display.
- [ ] **FE-NIDLO-PAY-14** — Email + SMS receipt confirmation via → BE-NIDLO-NOTIF-04.

### 5.7 — Refund status display 🟡

Refunds are admin-issued in beta (no in-app dispute UI). Frontend renders refund state when `payment.refundedAt !== null`.

- [x] **FE-NIDLO-PAY-15** — Backend now exposes `refundedAt` + `refundReason` on `PaymentType` (BE-NIDLO-PAY-14 ✅). FE [`payment-section.tsx`](src/components/payment/payment-section.tsx) `PaymentRow` renders a status-info-soft pill below the row when `refundedAt` is set: "Refunded {date}" + reason if present. Pill uses semantic info tokens. (closed B62)

### 5.8 — Payment history 🟡

- [x] FE-NIDLO-PAY-16 — Per-order via `paymentSection`. Standalone history page deferred — reach via `/orders` for now.
- [ ] **FE-NIDLO-PAY-17** — Standalone `/profile/payments` history list — Snad decision.

**Backend deps:** BE-NIDLO-PAY-01 (Moolre + Paystack gateway manager), BE-NIDLO-PAY-08 (cancellation refund policy), BE-NIDLO-PAY-09 (refund metadata on `payments`), BE-NIDLO-NOTIF-04 (receipt email/SMS), BE-NIDLO-PAY-10 (idempotency on webhooks — audit-flagged).

---

## Phase 6 — Wallet & payouts (designer-side)

**Status:** 🟡 — wallet manager + payout list working; guard race + add-flow re-resolve gaps.
**Spec screens:** 20

### 6.1 — Resolve MoMo account ✅

- [x] FE-NIDLO-WALLET-01 — `resolveMomoAccount(phone, network)` mutation. Returns `accountName` + `network`.

### 6.2 — Add wallet ✅

- [x] FE-NIDLO-WALLET-02 — `addWalletAccount` after resolve. → BE-NIDLO-WALLET-03 forces re-resolve at backend (closed audit C3).

### 6.3 — Set primary wallet ✅

- [x] FE-NIDLO-WALLET-03 — `setPrimaryWalletAccount` mutation.

### 6.4 — Remove wallet ✅

- [x] FE-NIDLO-WALLET-04 — `removeWalletAccount` mutation with confirmation modal.

### 6.5 — Payout list 🟡

- [x] FE-NIDLO-PAYOUT-01 — `myPayouts` query, paginated.
- [x] FE-NIDLO-PAYOUT-02 — `WalletTransactions` ([wallet-transactions.tsx](src/components/wallet/wallet-transactions.tsx)).
- [x] **FE-NIDLO-PAYOUT-03** — `payout-section.tsx` already renders a "Retry" button on `payout.status === "failed"` for the designer; legacy `text-orange-700`/`bg-orange-100` + `text-gray-700`/`bg-gray-100` swept to semantic tokens (`text-status-warning-fg`, `bg-status-warning-soft`, `text-muted-foreground`, `bg-muted`). (closed B15)

### 6.6 — Auto-refund display (24h unclaimed) ⬜

- [ ] **FE-NIDLO-PAYOUT-04** — When designer hasn't claimed within 24h, display "Auto-refund pending" pill. → BE-NIDLO-PAYOUT-05.

### 6.7 — Wallet guard fix ⬜

- [x] **FE-NIDLO-WALLET-05** — Audit H7 — `useAuthGuard` extended with `requireDesigner` + `designerRedirectTo`; wallet/page, orders/new/page, onboarding/page now consume it instead of rolling their own post-mount `router.replace`. Skeleton shows until guard fully resolves. (closed B14)

**Backend deps:** BE-NIDLO-WALLET-03 (re-resolve on add — closed C3), BE-NIDLO-PAYOUT-04 (failed retry), BE-NIDLO-PAYOUT-05 (auto-refund cron).

---

## Phase 7 — Messaging

**Status:** 🟡 — basic conversation working with Reverb; lightbox a11y broken; offline send queue not built.
**Spec screens:** 21

### 7.1 — Conversation list 🟡

- [x] FE-NIDLO-MSG-01 — [messages/page.tsx](src/app/messages/page.tsx) — `useConversations` hook + Echo refresh on `user.{userId}` channel `.message.sent`.
- [x] FE-NIDLO-MSG-02 — `ConversationListItem` ([conversation-list-item.tsx](src/components/messages/conversation-list-item.tsx)).
- [x] **FE-NIDLO-MSG-03** — Empty state present in [messages/page.tsx](src/app/messages/page.tsx) with role-aware copy. (verified B12)

### 7.2 — Conversation view 🟡

- [x] FE-NIDLO-MSG-04 — [messages/[conversationId]/page.tsx](src/app/messages/[conversationId]/page.tsx).
- [x] FE-NIDLO-MSG-05 — `MessageBubble` + `DateSeparator` + `ChatInput`.
- [x] **FE-NIDLO-MSG-06** — Audit M8 — `messagesByDate` now `useMemo([messages])`. (closed B12)
- [x] **FE-NIDLO-MSG-07** — Audit M16 — `linkify.tsx` trims trailing `.,;:!?)]` from matched URLs and emits the punctuation as a sibling text node. (closed B12)

### 7.3 — Send / receive 🟡

- [x] FE-NIDLO-MSG-08 — `sendMessage` mutation via `apollo-upload-client` (text + optional image).
- [x] FE-NIDLO-MSG-09 — Receive via Echo `.message.sent` → optimistic insert + refetch.

### 7.4 — Media attachments (ImageKit) 🟡

- [x] FE-NIDLO-MSG-10 — `ChatInput` ([chat-input.tsx](src/components/messages/chat-input.tsx)) image upload.
- [x] **FE-NIDLO-MSG-11** — Audit M21 — chat-input now overlays "Uploading..." (translucent backdrop + spinner + status `aria-live`) on the image preview while `uploading === true`; X close button is hidden during upload to prevent confusion. (closed B13)
- [x] **FE-NIDLO-MSG-12** — Audit H10 — backend mime-sniffing on uploads. (closed B63 — backend `MediaValidator` reads magic bytes via `UploadedFile::getMimeType()` on every upload mutation incl. `sendMessage` attachments path; allowlist + size cap; 9 backend tests verify hostile `<?php` files with `.jpg` extension are rejected.) → BE-NIDLO-MEDIA-01 (closed).
- [x] **FE-NIDLO-MSG-13** — Audit H12 — `aria-label="Remove attached image"` on chat-input X button. (closed B12)

### 7.5 — Read receipts 🟡

- [x] FE-NIDLO-MSG-14 — `markRead` mutation called on conversation view mount.
- [x] **FE-NIDLO-MSG-15** — `MessageBubble` already renders `Check` (sent) / `CheckCheck` (read) on own messages when `showReadReceipt` is true. (verified B13)

### 7.6 — Real-time push (Reverb) 🟡

- [x] FE-NIDLO-MSG-16 — `private-conversation.{id}` channel listened. → BE-NIDLO-MSG-04.
- [x] **FE-NIDLO-MSG-17** — Conversation page now calls `useEchoReconnect(echo, refetch)`; messages list also wired. Reconnect refetches the source-of-truth instead of relying on missed `.message.sent` events. (closed B18)

### 7.7 — Message reporting 🔒

Phase 2 — designer-to-client messaging in beta is curated.

### 7.8 — Offline send queue 🔒

Phase 2 — beta acceptable to require online.

### 7.9 — Lightbox a11y fix ⬜ (audit H1)

- [x] **FE-NIDLO-MSG-18** — `message-lightbox.tsx` rewritten on top of shadcn `Dialog` (Radix primitives provide focus trap, `role="dialog"`, `aria-modal`, return-focus-on-close); `MessageBubble` updated to controlled `open`/`onOpenChange` API; `DialogTitle.sr-only` for a11y label. (closed B12, H1)

**Backend deps:** BE-NIDLO-MSG-01 (`conversations`), BE-NIDLO-MSG-02 (`sendMessage`), BE-NIDLO-MSG-04 (private-conversation broadcast), BE-NIDLO-MEDIA-01 (mime-sniff on upload).

---

## Phase 8 — Notifications

**Status:** 🟡 — in-app list + preferences working; FCM SW closed (A7); FCM token wiring missing.
**Spec screens:** 22

### 8.1 — In-app bell + unread count 🟡

- [x] FE-NIDLO-NOTIF-01 — Header bell with unread count from `useNotificationsStore`.
- [x] FE-NIDLO-NOTIF-02 — Updated via `UNREAD_NOTIFICATIONS_COUNT` query + Echo `notification.received` event.
- [x] **FE-NIDLO-NOTIF-03** — Audit H12 — `aria-label` on header bell + messages icons; reads unread count when present. (closed B12)

### 8.2 — Notification center / list 🟡

- [x] FE-NIDLO-NOTIF-04 — [notifications/page.tsx](src/app/notifications/page.tsx) — `MY_NOTIFICATIONS` query, mark-read on click.
- [x] FE-NIDLO-NOTIF-05 — Categories: orders, messages, payments, reviews, payouts.

### 8.3 — FCM push permission prompt ⬜

- [x] **FE-NIDLO-PUSH-01** — `usePushNotifications` no longer auto-prompts; it silently registers the FCM token only when permission is already `granted`. New companion `usePushPermission()` hook drives an explicit "Enable notifications" affordance on `/notifications` (gated by `permission === "default"` and a `localStorage["nidlo:push:prompted"]` flag set after any user choice). Once dismissed, the prompt never returns. (closed B19)

### 8.4 — FCM token registration on login ⬜

- [x] **FE-NIDLO-PUSH-02** — Token registration auto-runs in `usePushNotifications` when `Notification.permission === "granted"` (silent path) and after a successful prompt acceptance in `usePushPermission`. Single source for `registerForPushImpl`. (closed B19)

### 8.5 — Service worker receives push ✅ (closed A7, FE-FIREBASE-SW)

- [x] FE-NIDLO-PUSH-03 (closed A7, FE-FIREBASE-SW) — [public/firebase-messaging-sw.js](public/firebase-messaging-sw.js) reads config from URL query params; safe no-op when missing.
- [ ] **FE-NIDLO-PUSH-04** — Ops task (not frontend code): populate `NEXT_PUBLIC_FIREBASE_*` + `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in Vercel, then verify foreground + background push. Frontend wiring already complete (PUSH-01 / PUSH-02 / NOTIF-10 closed B19/B18).

### 8.6 — Notification deep-link routing ⬜

- [x] **FE-NIDLO-NOTIF-06** — `notifications/page.tsx` already navigates to `notification.actionUrl` on click; the click handler also marks the notification read. (verified B13)

### 8.7 — Email notifications (Resend / Maileroo) 🟡

Backend-driven (BE-NIDLO-NOTIF-04). Frontend renders unsubscribe page.

- [x] **FE-NIDLO-NOTIF-07** — New [`/unsubscribe`](src/app/unsubscribe/page.tsx) route (Suspense-wrapped) with `robots: { index: false, follow: false }`. Reads `?token=` via a client island; with-token path shows a "we received your request" message + CTA to preferences, no-token path shows the manage-preferences fallback. Backend one-click flow remains BE-NIDLO-NOTIF-05; the frontend already absorbs links from email until then. (closed B27)

### 8.8 — SMS notifications (Arkesel / Hubtel) 🟡

Backend-driven. No frontend surface beyond preferences screen.

### 8.9 — Notification preferences 🟡

- [x] FE-NIDLO-NOTIF-08 — [notifications/preferences/page.tsx](src/app/notifications/preferences/page.tsx) — per-category email / push / SMS toggles.
- [x] **FE-NIDLO-NOTIF-09** — Backend now exposes `quietHoursStart` / `quietHoursEnd` on `myNotificationPreferences` (BE-NIDLO-NOTIF-06 ✅). FE reads them via `useQuery` in `usePushNotifications` (cache-first); foreground `onMessage` calls [`isInQuietHours(start, end)`](src/lib/utils/quiet-hours.ts) to suppress the toast during the window — unread badge still increments so the notification surfaces on next open. New utility covers both same-day + overnight (22:00→07:00) windows with 14 unit tests. (closed B60)
- [x] **FE-NIDLO-NOTIF-10** — Audit M13 — `usePushNotifications` opens a `BroadcastChannel("nidlo:push:dedupe")`; foreground `onMessage` payloads are keyed by `messageId` and gossiped across tabs. Sibling tabs that already saw an id skip the toast + unread increment. Dedupe set is FIFO-capped at 200 to bound memory. (closed B18)

**Backend deps:** BE-NIDLO-PUSH-01 (`registerDeviceToken`), BE-NIDLO-NOTIF-04 (email + SMS dispatcher), BE-NIDLO-NOTIF-05 (unsubscribe token), BE-NIDLO-NOTIF-06 (quiet hours).

---

## Phase 9 — Reviews & ratings

**Status:** 🟡 — review form + display working; designer reply UI deferred.
**Spec screens:** 23

### 9.1 — Post-delivery review prompt 🟡

- [x] FE-NIDLO-REVIEW-01 — [review-prompt-dialog.tsx](src/components/reviews/review-prompt-dialog.tsx) — fires on `delivered` status + open review window.

### 9.2 — Star rating + tags + free-text 🟡

- [x] FE-NIDLO-REVIEW-02 — [review-form.tsx](src/components/reviews/review-form.tsx) — 5-star + tags (responsive / on-time / matched-design) + free-text.
- [x] FE-NIDLO-REVIEW-03 — Photo upload via [review-photo-upload.tsx](src/components/reviews/review-photo-upload.tsx).

### 9.3 — Review window enforcement 🟡

Backend-enforced — frontend hides the prompt + form when window expired.

- [ ] **FE-NIDLO-REVIEW-04** — Confirm review window length with backend (XLent uses 7-day; Nidlo TBD by Snad). → BE-NIDLO-REVIEW-01.
- [x] **FE-NIDLO-REVIEW-05** — Review deadline label shipped (closed B103). New `REVIEW_WINDOW_DAYS = 7` constant + `getReviewDeadlineLabel(deliveredAt)` helper in [lib/utils/order.ts](src/lib/utils/order.ts) — renders "Review by Tue 7 May" while open, "Review window closed" past cutoff, null when not yet delivered. Wired into `/orders/[id]` next to the "Leave a Review" CTA so clients see the deadline at-a-glance. 5 new Vitest tests cover null-input, mid-window, expired, custom-window, and boundary semantics. Default mirrors XLent's 7-day pattern; canonical value will swap in via → BE-NIDLO-REVIEW-01 once Snad confirms (FE-NIDLO-REVIEW-04).

### 9.4 — Review display on designer profile ✅

- [x] FE-NIDLO-REVIEW-06 — [reviews-section.tsx](src/components/reviews/reviews-section.tsx) + [review-card.tsx](src/components/reviews/review-card.tsx) on designer detail.
- [x] FE-NIDLO-REVIEW-07 — [rating-breakdown.tsx](src/components/reviews/rating-breakdown.tsx) on designer hero.

### 9.5 — Designer response 🔒

Phase 2 — public review reply UI deferred.

- [ ] **FE-NIDLO-REVIEW-08** (Phase 2) — Wire [designer-response-form.tsx](src/components/reviews/designer-response-form.tsx) — already built but flow not surfaced to designers.

**Backend deps:** BE-NIDLO-REVIEW-01 (`createReview` + window enforcement), BE-NIDLO-REVIEW-02 (rating aggregate refresh).

---

## Phase 10 — Profile & settings

**Status:** 🟡 — profile + edit working; settings root + many sub-pages missing.
**Spec screens:** 24

### 10.1 — My profile (self-view) 🟡

- [x] FE-NIDLO-PROFILE-01 — [profile/page.tsx](src/app/profile/page.tsx) — name, phone, email, avatar, KYC status, links.
- [x] **FE-NIDLO-PROFILE-02** — Audit M15 — every `useAuthStore()` whole-store destructure swept to single-field selectors. Touched: `use-auth-guard.ts`, `use-guest-guard.ts`, `header.tsx`, `auth/role/page.tsx`, `auth/layout.tsx`, `auth-provider.tsx`, `onboarding/client/page.tsx`. `grep "useAuthStore()"` now returns zero hits in `src/`. Each consumer only re-renders when the specific slice it reads changes. (closed B25)

### 10.2 — Profile edit 🟡

- [x] FE-NIDLO-PROFILE-03 — [profile/edit/page.tsx](src/app/profile/edit/page.tsx) — name, location, bio (designer), avatar.
- [x] **FE-NIDLO-PROFILE-04** — Avatar already auto-saves on file pick (separate `updateAvatar` mutation). Personal-information section's Save button now tracks dirty state — disabled and labelled "Saved" when nothing differs from `user`, enabled with "Save Changes" when any field (firstName / lastName / otherNames / city — including the "add new city" inline mode) diverges. (closed B24)

### 10.3 — Avatar upload 🟡

- [x] FE-NIDLO-PROFILE-05 — ImageKit upload + crop preview.
- [x] **FE-NIDLO-PROFILE-06** — Audit M21 — avatar upload now overlays a `Loader2` spinner with `role="status" aria-live="polite"` over the avatar circle while uploading; button disabled with `cursor-wait`. (closed B15)

### 10.4 — Change phone (re-OTP) ⬜

- [ ] **FE-NIDLO-PROFILE-07** — `requestPhoneChange` + OTP verify. → BE-NIDLO-AUTH-07.

### 10.5 — Change email (verify) ⬜

- [ ] **FE-NIDLO-PROFILE-08** — Add / change email with verification. → BE-NIDLO-AUTH-08.

### 10.6 — Settings root ⬜

- [x] **FE-NIDLO-SETTINGS-01** — New [`/settings`](src/app/settings/page.tsx) page with tile grid: Account → `/profile/edit`, Notifications → `/notifications/preferences`, Wallet → `/wallet` (designer-only filter), Privacy + Help & Support → `/contact`. Phase 2 placeholders for Change phone + Delete account shown disabled under "Coming soon". Log out button at the bottom uses the shared `useLogout` hook. (closed B25)

### 10.7 — Notification prefs ✅ (already at /notifications/preferences)

Move under `/settings/notifications` as part of 10.6.

### 10.8 — Privacy / contact visibility ⬜

- [ ] **FE-NIDLO-SETTINGS-02** — Toggle "Hide phone from designers until accepted" (P-07 analog). → BE-NIDLO-PROFILE-05.

### 10.9 — Change password ⬜

- [ ] **FE-NIDLO-SETTINGS-03** — Only when email is attached. → BE-NIDLO-AUTH-09.

### 10.10 — Delete account / right-to-be-forgotten ⬜

- [ ] **FE-NIDLO-SETTINGS-04** — Two-step confirmation + 30-day soft-delete. → BE-NIDLO-PROFILE-06.

### 10.11 — T&C version display + accept-when-updated ⬜

- [x] **FE-NIDLO-SETTINGS-05** — T&C re-accept flow shipped (closed B72, component coverage closed B119). [TermsReacceptDialog](src/components/legal/terms-reaccept-dialog.tsx) wired into [AppShell](src/components/layout/app-shell.tsx) — fires non-dismissibly for any authed user whose `me.termsAcceptedVersion` differs from the BE's `legalVersions.termsVersion`. `LEGAL_VERSIONS` query + `ACCEPT_UPDATED_TERMS` mutation. 7 Vitest tests pin: hidden when versions match, visible when stale, suppressed for unauth / pre-hydration / null-acceptance (onboarding's job, not dialog's), accept-button fires mutation + refreshes auth-store version, and `/terms` link opens in a new tab with `noopener`. Closed alongside BE-NIDLO-LAUNCH-07.

### 10.12 — Support / about ✅

- [x] **FE-NIDLO-SETTINGS-06** — Help / Support / About + version surfaced (closed B95). [/settings](src/app/settings/page.tsx) now ships an "About" tile pointing at the new [/about](src/app/about/page.tsx) route (Nidlo elevator pitch + Terms / Privacy / Contact links). Build version footer at the bottom of `/settings` reads from new `APP_VERSION` export in [lib/config.ts](src/lib/config.ts) — falls back through `NEXT_PUBLIC_APP_VERSION` → first 7 chars of `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` → `dev` so it's useful in every deploy mode. FE typecheck clean + 115 tests pass.

**Backend deps:** BE-NIDLO-AUTH-07 (phone change), BE-NIDLO-AUTH-08 (email change), BE-NIDLO-AUTH-09 (password change), BE-NIDLO-PROFILE-05 (privacy toggle), BE-NIDLO-PROFILE-06 (soft-delete), BE-NIDLO-LEGAL-01 (T&C version table).

---

## Phase 11 — PWA + accessibility + polish

**Status:** 🟡 — manifest exists; offline + a11y gaps.

### 11.1 — PWA manifest + icons 🟡

- [x] FE-NIDLO-OPS-01 — [public/manifest.webmanifest](public/manifest.webmanifest) with SVG icons.
- [ ] **FE-NIDLO-OPS-02** — Add maskable PNGs (192/512) for Android adaptive icons.
- [ ] **FE-NIDLO-OPS-03** — Brand sweep (paired 0.C).

### 11.2 — Service worker for app shell offline ⬜ (audit H11)

- [x] **FE-NIDLO-OPS-04** — Audit H11 — new [`/offline`](src/app/offline/page.tsx) route (WifiOff illustration + "Try the home page" CTA) and `next-pwa.fallbacks.document = "/offline"` so document navigations while offline serve our branded shell instead of the browser default. Project-local `next-pwa.d.ts` extended with the `fallbacks` field. App-shell `StaleWhileRevalidate` strategy out of scope — next-pwa default caching covers static assets; auth-aware GraphQL POSTs intentionally never cached. (closed B21)

### 11.3 — PWA install prompt ⬜

- [x] **FE-NIDLO-OPS-05** — New [`PwaInstallPrompt`](src/components/shared/pwa-install-prompt.tsx) mounted in root layout: captures `beforeinstallprompt`, shows a sticky bottom-pinned card with Install / X actions, swallows the browser's mini-infobar via `preventDefault()`, hides itself when `display-mode: standalone` (or iOS Safari `navigator.standalone`), persists dismissal in `localStorage["nidlo:pwa:install-dismissed"]`, and auto-clears on `appinstalled`. iOS instruction-style banner deferred (no `react-ios-pwa-prompt` dependency added — outside scope). (closed B20)

### 11.4 — Accessibility pass ⬜

- [x] **FE-NIDLO-A11Y-01** — Audit H12 — `aria-label` swept across icon-only buttons: header (bell/messages B12, logout B16), chat-input (attach/send/photo-send), search (filter sheet trigger), notifications (settings link), profile/edit/orders-new/notifications-prefs (back arrows), profile (edit pencil), share-buttons (native share), voice-input (mic toggle), cost-book-panel (remove material), reference-image-upload (remove image), orders/new (clear client). (closed B16)
- [x] **FE-NIDLO-A11Y-02** — Audit H1 — focus-trap in `MessageLightbox` delivered via shadcn `Dialog` rewrite. (closed B12, MSG-18)
- [ ] **FE-NIDLO-A11Y-03** — Keyboard navigation across wizards (Tab order, Enter to advance, Esc to cancel).
- [ ] **FE-NIDLO-A11Y-04** — Color contrast audit — run axe-core on key pages (forms, payment, profile, modals).
- [ ] **FE-NIDLO-A11Y-05** — Screen-reader pass — announce status changes (loading, success, error toasts).

### 11.5 — Mobile responsive QA ⬜

- [ ] **FE-NIDLO-OPS-06** — Real-device sweep on small (5"), medium (6.1"), large (6.7") Android. iOS Safari sanity check.

### 11.6 — Dark mode 📐 (Snad decision per 0.A.6)

- [ ] **FE-NIDLO-OPS-07** — If yes: wire `next-themes` `ThemeProvider` + add toggle to settings + audit every screen for contrast. If no: ✅ defer to Phase 2.

---

## Phase 12 — Production launch

**Status:** ⬜ — pre-launch blockers remaining.

### 12.1 — Domain DNS ⬜

- [ ] **FE-NIDLO-OPS-08** — When `nidlo.com` is purchased: DNS to Vercel + cert + redirects from `stitchhub.com` (if owned) → `nidlo.com`. Per principles: don't hardcode `nidlo.com` until then.

### 12.2 — Vercel production env config ⬜

- [ ] **FE-NIDLO-OPS-09** — Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID`, `NEXT_PUBLIC_PUSHER_*` (Reverb), `NEXT_PUBLIC_IMAGEKIT_*` to production values. Verify all `NEXT_PUBLIC_*` references match.

### 12.3 — Sentry frontend wiring ⬜

- [ ] **FE-NIDLO-OPS-10** — Confirm `@sentry/nextjs` installed + DSN configured + source maps uploaded on build (paired 0.B.9).

### 12.4 — Mixpanel + GA4 wiring ⬜

- [ ] **FE-NIDLO-OPS-11** — Memory says Mixpanel + GA4 are scoped but never landed. Pre-beta: Mixpanel for funnel tracking (signup → onboarding → first order → payment).
- [ ] **FE-NIDLO-OPS-12** — GA4 page-view tracking — opt-out via cookie banner (paired FE-NIDLO-LEGAL-05).

### 12.5 — GDPR cookie banner ⬜

Per principles — Snad decision. EU expansion blocker only. → FE-NIDLO-LEGAL-05.

### 12.6 — Codegen for `types/graphql.ts` ⬜

Per 0.B.14 — replace hand-written `types/graphql.ts` with `graphql-codegen`. → FE-NIDLO-OPS-03.

### 12.7 — Smoke test pack ⬜

- [ ] **FE-NIDLO-OPS-13** — Vitest unit tests:
  - `useAuthStore` happy + hydration paths (currently the ONLY unit test).
  - `useLogout` clears Apollo + CSRF.
  - `useGuestGuard` + `useAuthGuard` redirect logic.
  - `csrfLink` reads cookie + sets header.
  - `errorLink` unauthenticated branch logs out.
- [ ] **FE-NIDLO-OPS-14** — Playwright E2E:
  - Phone OTP signup happy path.
  - Designer onboarding wizard.
  - Client commission flow → payment happy path.
  - Logout + cache clear.
  - Anonymous → designer profile → CTA → login redirect.

### 12.8 — Performance budget ⬜

- [ ] **FE-NIDLO-OPS-15** — Lighthouse: home / search / designer profile ≥ 90 on Mobile (LCP < 2.5s, CLS < 0.1).
- [x] **FE-NIDLO-OPS-16** — Audit M3 — home hero now RSC; only the auth-aware CTA buttons remain client-side. (closed B23, paired SEARCH-03)
- [x] **FE-NIDLO-OPS-17** — Audit M6 — `framer-motion` had zero usages (`grep -rn` clean across `src/`); removed via `yarn remove framer-motion`. ~80 KB gzipped recovered. (closed B17)
- [x] **FE-NIDLO-OPS-18** — Audit M7 — every remote-image surface backed by ImageKit converted to `next/image` with `fill` + `sizes`: designer profile portfolio + lightbox (B21), message-bubble photo + lightbox dialog, step-portfolio thumbs, step-review reference grid, step-reference-images thumbs, reference-image-upload thumbs, profile avatar circle, order-timeline update photos, review-card photos, order detail review/reference photo grids. Three remaining `<img>` tags (profile/edit avatar preview, chat-input pending image, review-photo-upload preview) all render local blob/base64 URLs that `next/image` can't optimize without `unoptimized: true`; intentionally left as-is. (closed B22)
- [x] **FE-NIDLO-OPS-19** — Audit M5 — `getImageKitThumbnail` now strips a leading `/tr:...` segment before applying the new transform, preventing chained `/tr:.../tr:.../file.jpg` URLs. (closed B16)

### 12.9 — Brand sweep (paired 0.C) ✅ when 0.C done

---

## Audit findings closed (cross-reference)

| ID | Sprint | Description |
|---|---|---|
| FE-CSRF | A1 | Wired `csrfLink` + `ensureCsrfCookie()` warm-up in `AuthProvider` + `resetCsrfState()` on logout. New helpers in [src/lib/graphql/csrf.ts](src/lib/graphql/csrf.ts). |
| FE-LOGOUT | A2 | `apolloClient.clearStore()` consolidated into single `useLogout()` hook. Inline copies in `header.tsx` and `profile/page.tsx` removed. |
| FE-PHONE-URL | A2 | Phone moved from URL query to `sessionStorage`. Stays out of browser history, access logs, Referer headers. |
| FE-PAY-REF | A3 | Payment callback verifies `payment.orderId === orderId`. |
| FE-XSS | A5 | `safeJsonForScript()` escapes `<>&` + U+2028/U+2029 in JSON-LD. |
| FE-FIREBASE-SW | A7 | Service worker reads FCM config from registration URL query params; safe no-op when missing. |
| FE-MAPS-KEY | A7 | Verified `.env.local` is gitignored and never tracked. |

---

## Audit findings open / known gaps

Full mapping of [audits/frontend/99_FINDINGS.md](../audits/frontend/99_FINDINGS.md) → close sprint or owning task.

| Audit ID | Severity | Mapped task | Description |
|---|---|---|---|
| C1 | Critical | closed A1 | CSRF protection missing — `csrfLink` + `ensureCsrfCookie` + `resetCsrfState` shipped. |
| C2 | Critical | closed A7 | Google Maps API key committed in `.env.local` — rotated + gitignored. |
| C3 | Critical | closed A2 | Logout duplicated in 3 places — consolidated via `useLogout()`; Apollo `clearStore()` always runs. |
| C4 | Critical | closed A5 | `dangerouslySetInnerHTML` JSON-LD `</script>` injection — `safeJsonForScript` escapes `<>&` + U+2028/2029. |
| C5 | Critical | closed B9 | SSR designer fetch — slug regex `/^[a-z0-9-]+$/` + error logging on catch. |
| C6 | Critical | closed A2 | Phone leaked in URL — moved to `sessionStorage` under `nidlo:auth:pendingPhone`. |
| C7 | Critical | closed A7 | Firebase SW shipped placeholder config — config now passed via SW query string. |
| C8 | Critical | closed A2 | `isAuthenticated` only computed at hydration — Zustand v5 hydration pattern + `_hasHydrated` guard. |
| H1 | High | closed B12 | `MessageLightbox` rewritten on shadcn `Dialog` — focus trap, `role="dialog"`, `aria-modal`, return-focus-on-close all from Radix. (FE-NIDLO-MSG-18 closed) |
| H2 | High | closed | Pay page money is server-computed via `paymentSummary`; callback path uses stable URL. (FE-NIDLO-PAY-02 + FE-NIDLO-PAY-05 closed) |
| H3 | High | closed B17 | Payment OTP UI now has 5-min countdown, attempts-remaining, expired session, 30s resend cooldown. (FE-NIDLO-PAY-07 closed) |
| H4 | High | closed | MoMo polling now properly awaited; `MomoPendingScreen` retired in favour of `useMomoPolling`. (FE-NIDLO-PAY-08 closed) |
| H5 | High | closed A3 | Payment callback didn't verify reference belongs to order — `payment.orderId === orderId` check before success render. |
| H6 | High | closed B8 + B96 | `/auth/role` consolidated behind `useAuthGuard({ redirectOnboardedTo })`; redundant `useEffect` and ad-hoc `isLoading` removed. (FE-NIDLO-AUTH-18 closed) |
| H7 | High | closed B14 | `useAuthGuard` extended with `requireDesigner` + `designerRedirectTo`; wallet/page, orders/new/page, onboarding/page consume it instead of post-mount `router.replace`. Skeleton renders until guard fully resolves. (FE-NIDLO-WALLET-05 closed) |
| H8 | High | closed | `useSearchParams` now Suspense-wrapped on both `/orders/[id]/pay` and the callback route. (FE-NIDLO-PAY-04 + FE-NIDLO-PAY-12 closed) |
| H9 | High | closed | Apollo cache `keyArgs: ["input"]` merge replaced with explicit `mergeDesignerPage` that dedupes by id (B41 + B55). (FE-NIDLO-SEARCH-10 closed) |
| H10 | High | closed B63 | Client-side mime check is bypassable; backend mime-sniff now ships via `MediaValidator` (FE-NIDLO-MSG-12 / BE-NIDLO-MEDIA-01) — every upload mutation reads detected mime via `UploadedFile::getMimeType()` (PHP `finfo` magic-byte sniff) before any storage / inference. |
| H11 | High | FE-NIDLO-OPS-04 | PWA `next-pwa` no offline fallback. |
| H12 | High | closed | All icon-only buttons across the app now carry `aria-label` (close, mark-read, attach, remove, etc.). (FE-NIDLO-A11Y-01 + FE-NIDLO-NOTIF-03 + FE-NIDLO-MSG-13 + FE-NIDLO-SEARCH-11 closed) |
| H13 | High | closed B116 | Header logout button now reads `loading` from `useLogout()`, swaps the icon for a spinning `Loader2`, sets `disabled` + `aria-busy` while the LOGOUT mutation is in flight. No more double-click race on slow networks. (FE-NIDLO-AUTH-21 closed) |
| H14 | High | closed B54 | All three `react-hooks/exhaustive-deps` disables now have explanatory comments documenting the intentional single-fire pattern: `auth-provider.tsx` Me-validation, `location-picker.tsx` map setup, `location-picker.tsx` autocomplete setup. Restructuring would break each closure. |
| M1 | Med | closed B55 | `mergeDesignerPage` now uses an explicit `DesignerPage` interface (`data?: unknown[]; [key: string]: unknown;`) instead of `Record<string, unknown>`. Cast at the cache boundary is documented and concentrated in one place. |
| M2 | Med | closed | SSR designer fetch tuned per FE-NIDLO-DESIGNER-09. |
| M3 | Med | FE-NIDLO-OPS-16 | Heavy client bundle on home page; convert hero to RSC. |
| M4 | Med | closed B55 | `RealtimeProvider` is now the sole owner of the unread-count fetches; the `useUnreadCount` hook in `use-messages.ts` was orphan code (zero call-sites) — removed along with its now-unused imports. Messages list reads from `useMessagesStore` populated by RealtimeProvider, not a redundant query. |
| M5 | Med | closed | `getImageKitThumbnail` now idempotent against existing `tr:` segments (B29 covers it). (FE-NIDLO-OPS-19 closed) |
| M6 | Med | closed | `framer-motion` audited as tree-shaken; named imports only. (FE-NIDLO-OPS-17 closed) |
| M7 | Med | closed | `<img>` swapped for `next/image` across the auth-gated UI; remaining `<img>` usages are local-blob previews documented in B22. (FE-NIDLO-OPS-18 closed) |
| M8 | Med | closed B12 | `messagesByDate` wrapped in `useMemo([messages])` so it only recomputes when the message list changes. (FE-NIDLO-MSG-06 closed) |
| M9 | Med | closed B7 | Hardcoded `bg-yellow-100` / `bg-green-100` / `bg-red-100` replaced with semantic tokens (`bg-status-pending-soft`, `bg-status-success-soft`, `bg-status-error-soft`) across payment + order components. (FE-NIDLO-PAY-10 closed) |
| M10 | Med | (Phase 0.C deferred) | "StitchHub" → "Nidlo" code-identifier rename is a deliberate separate sprint per CLAUDE.md rebrand note; user-facing copy already uses Nidlo. |
| M11 | Med | closed B7 | Hardcoded `https://stitchhub.com` fallbacks centralised into [lib/config.ts](src/lib/config.ts) `APP_URL` — imported by layout / sitemap / robots / json-ld. (FE-NIDLO-LEGAL-04 closed) |
| M12 | Med | closed B98 | All static-lookup callsites (`GET_COUNTRIES`, `GET_CITIES`, `GET_SPECIALIZATIONS`, `GET_FASHION_INTERESTS`, `LEGAL_VERSIONS`) explicitly opt into `fetchPolicy: "cache-first"`; global `cache-and-network` default stays for dynamic data. Audit row's cross-ref to FE-NIDLO-OPS-02 was a typo — that ticket is about PWA maskable PNGs. |
| M13 | Med | closed | Cross-tab push dedupe via `BroadcastChannel`. (FE-NIDLO-NOTIF-10 closed) |
| M14 | Med | closed B43 | `parseSpecs` / `parseList` consolidated into [`parseStringList`](src/lib/utils/parse-list.ts); 3 call-sites updated; 11 regression tests cover the coercion contract. |
| M15 | Med | closed | `useAuthStore` consumers refactored to selector form `(s) => s.user` etc. (FE-NIDLO-PROFILE-02 closed) |
| M16 | Med | closed B12 | `linkify` regex now trims trailing punctuation (`.,!?;:`); covered by 10 tests in B29. (FE-NIDLO-MSG-07 closed) |
| M18 | Med | closed | Voice input language now driven by browser locale with `en-GH` fallback. (FE-NIDLO-COMM-09 closed) |
| M19 | Med | FE-NIDLO-OPS-04 (related) | SW network strategies not explicitly configured. |
| M17 | Med | closed B11 + B39 | `Math.ceil(confirmedPrice / 2)` deposit fallback removed — server `paymentSummary` is sole source; `calculateDeposit/Balance` helpers deleted as orphans. |
| M20 | Med | 0.B.9 + FE-NIDLO-OPS-10 | `errorLink` logs to console only — no Sentry. |
| M21 | Med | closed B13/B15 | Upload progress UI now overlays both chat-input and avatar uploads with translucent backdrop + spinner + status `aria-live`; X close button hidden during upload. (FE-NIDLO-PROFILE-06 + FE-NIDLO-MSG-11 closed) |
| M22 | Med | (deliberate) | Echo authorizer assigns `Pusher` to `window` once at module init. The `as unknown as Record` cast is the documented Echo+Pusher integration pattern; runs once globally rather than per-instance. |
| M23 | Med | (tech-debt) | Notifications / messages stores not persisted — 0-count flash. |
| M24 | Med | FE-NIDLO-ONBD-09 + FE-NIDLO-ONBD-16 | Onboarding stores persist PII in localStorage with no TTL. |
| T1 | Test | partial B29-B45 | Test footprint expanded 3 → 101 across 11 files. Auth-flow E2E still pending FE-NIDLO-AUTH-10. |
| T2 | Test | FE-NIDLO-OPS-14 | Playwright E2E covers a single smoke test. Full coverage backlog. |
| T3 | Test | partial B29 | Vitest setup file imports `@testing-library/jest-dom/vitest` + jsdom env wired in `vitest.config.ts`. |
| T4 | Test | FE-NIDLO-A11Y-04 | No automated a11y regression — `axe-core` integration backlog. |
| T5 | Test | 0.B.14 + FE-NIDLO-OPS-03 | No type-tests on `types/graphql.ts` — codegen will replace the hand-written file entirely. |
| T1–T5 | Test | FE-NIDLO-OPS-13 + FE-NIDLO-OPS-14 | Only 2 tests in entire repo (1 Vitest unit + 1 Playwright). |

---

## Cross-repo dependency summary

| Dep ID (this repo) | What | Blocks phase |
|---|---|---|
| BE-NIDLO-AUTH-01..09 | Auth: OTP, social, logout-all, phone/email change, password change | 1, 10 |
| BE-NIDLO-AUTH-06 | UUID broadcast channel fix (audit C2) | 4 |
| BE-NIDLO-PROFILE-01..06 | Profile: become-designer, complete-onboarding (designer + client), PII scrub on public, privacy toggle, soft-delete | 1, 2, 10 |
| BE-NIDLO-DESIGNER-01..03 | Designer search + detail + slugs | 2 |
| BE-NIDLO-LOOKUP-01..04 | Specializations, fashion interests, slug lookups | 1, 2 |
| BE-NIDLO-COMM-01 | createOrder | 3 |
| BE-NIDLO-ORDER-04 | Server-enforced `isAcceptingOrders` | 2, 3 |
| BE-NIDLO-ORDER-08 | Eager-load `myOrders` + `orderDetail` (audit C8 N+1 fix) | 4 |
| BE-NIDLO-ORDER-09..12 | Response timeout, drafts, clone, proof-of-completion uploads | 3, 4 |
| BE-NIDLO-PAY-01..10 | Moolre + Paystack, refund metadata, idempotency, cancellation refund policy | 5 |
| BE-NIDLO-WALLET-03 | Re-resolve wallet on add (audit C3, closed) | 6 |
| BE-NIDLO-PAYOUT-04..05 | Failed-retry + auto-refund cron | 6 |
| BE-NIDLO-MSG-01..04 | Conversations, sendMessage, broadcast | 7 |
| BE-NIDLO-MEDIA-01 | Backend mime-sniff on upload (audit H10) — **closed B63** | 7 |
| BE-NIDLO-NOTIF-04..06 | Email/SMS dispatch, unsubscribe token, quiet hours | 5, 8 |
| BE-NIDLO-PUSH-01 | registerDeviceToken | 8 |
| BE-NIDLO-REVIEW-01..02 | createReview + window enforcement, rating aggregate | 9 |
| BE-NIDLO-LEGAL-01 | T&C version table | 10 |
| BE-NIDLO-STATS-01 | Public counts (designers, cities) | 2 |
| FS-NIDLO-MEAS-01 | `/measure/avatar` working (audit FS C6 broken) | 3 |
| FS-NIDLO-MEAS-02 | Mesh height rescaling (audit FS H13 broken) | 3 |
| FS-NIDLO-MEAS-03 | Anthropic consent flag + photo retention | 3 |
| FS-NIDLO-MEAS-04 | Error taxonomy + low-confidence response | 3 |
| AD-NIDLO-VERIFY-01 | KYB review queue (Filament) | 1 |
| AD-NIDLO-RECOVER-01 | Account recovery review queue (Filament) | 1 |

---

## How to use this roadmap

1. **Pick a phase** — start with Phase 0 cross-cutting foundations (rules + tokens + brand), they unblock everything.
2. **Before touching a screen**, Snad shares Figma URL → paste into the screen index for that row + flip status emoji.
3. **Run `/x-implement <FE-NIDLO-XYZ-NN>`** — Phase 0 of the command parses + scopes + clarifies; Phase 1 implements; Phase 2 self-checks against `.claude/rules.md`.
4. **Flip the checkbox** when acceptance criteria pass.
5. **Commit per task** — keep PR story coherent; use the FE-NIDLO-* ID in the commit message.
6. **Close audit findings inline** — when fixing a screen, sweep nearby audit IDs in the same PR (e.g. while wrapping `/pay/page.tsx` in Suspense for H8, also fix H2 and the M9 token literals on the same page).

For Figma-dependent rows the expected exchange is:
> **Claude:** "Working on Screen N — share the Figma URL so I can cross-check."
> **Snad:** `<figma-url>` — or "no Figma yet, generate one" (Claude drafts + iterate).

---

## Cross-references

- Audit findings: [audits/frontend/99_FINDINGS.md](../audits/frontend/99_FINDINGS.md)
- Backend deps tracking: [backend/TASKS.md](../backend/TASKS.md)
- Admin scope: [backend/ROADMAP_ADMIN.md](../backend/ROADMAP_ADMIN.md)
- Fitscan scope: [fitscan/TASKS.md](../fitscan/TASKS.md)
- Sprint summary: [memory/project_audits.md](https://example.invalid)
- Architecture decisions: [CLAUDE.md](../CLAUDE.md)
- Frontend auth patterns: [memory/MEMORY.md "Frontend Auth (critical patterns)"]
- Journey docs (frontend-touching): [docs/journeys/00-cross-cutting.md](../docs/journeys/00-cross-cutting.md), [01-client.md](../docs/journeys/01-client.md), [02-designer.md](../docs/journeys/02-designer.md), [04-anonymous.md](../docs/journeys/04-anonymous.md), [05-failure-modes.md](../docs/journeys/05-failure-modes.md)

---

**Last updated:** 2026-05-01 by Snad + Claude
