# Nidlo frontend QA test checklist

This directory holds the **canonical** QA test checklist for the Nidlo PWA (frontend).

## File

[QA_TEST_CHECKLIST.csv](QA_TEST_CHECKLIST.csv) — 364 rows, 21 columns. Mirrored to `../qa/frontend.csv` at workspace root for project-lead access.

## Quick-start

1. Open `QA_TEST_CHECKLIST.csv` in Google Sheets (`File → Import → Upload`).
2. Sort or filter by `feature_area` (Auth / Onboarding / Search / Order / Payment / Messaging / Notifications / Wallet / Reviews / Profile / Settings / Legal / PWA / Cross-cutting / Verification / Dashboard / Commission / Measurements).
3. Run each row's `test_steps` against the live PWA. Confirm `expected_result`.
4. Update `status` (Pass / Fail / Blocked / N/A), `tester`, `tested_on`, `notes_or_bug_link`.

Full schema reference: [../../qa/README.md](../../qa/README.md).

## What's covered

| Feature area | Rows |
|---|---|
| Auth (phone, OTP, social, hydration, guards) | 40 |
| Onboarding (designer + client wizards) | 24 |
| Verification (KYC docs) | 12 |
| Profile (self, public, SEO, share) | 25 |
| Search & Discovery | 25 |
| Commission / Blueprint wizard | 20 |
| Body Measurements (manual + AI) | 20 |
| Order lifecycle | 35 |
| Payment (Moolre OTP + Paystack + callback + webhook) | 35 |
| Wallet / payouts (designer) | 15 |
| Messaging (real-time + photos + read receipts) | 20 |
| Notifications (in-app + push + prefs + quiet hours) | 21 |
| Reviews & ratings | 10 |
| Dashboard (role-aware) | 5 |
| Settings | 12 |
| Legal pages | 8 |
| PWA / offline / install | 12 |
| Cross-cutting (a11y, money, hydration, error UX) | 25 |

## Coverage assertions

- ✅ Every `page.tsx` route under `frontend/src/app/` has at least one row.
- ✅ Every Sprint 1–9 deliverable in commit history is represented.
- ✅ Every row references a `roadmap_ref` (FE-NIDLO-* task ID) for traceability.
- ✅ Roadmap gaps from [backend/audits/qa-roadmap-gaps-2026-05-04.md](../../backend/audits/qa-roadmap-gaps-2026-05-04.md) tagged `roadmap-gap` in `dependencies`.

## When to update this file

- A new page or component ships → add rows for happy + branch + error + edge.
- A feature changes user-visible behaviour → update affected rows' `expected_result` and bump `last_updated`.
- A feature is removed / deferred → set `status=N/A` and note the removal date in `notes_or_bug_link`.

Do **NOT**:
- Delete rows historically (set `N/A` instead — preserves regression history).
- Hand-edit row IDs (they are stable; appending new ones is fine).
- Edit only this copy — the workspace mirror at `../../qa/frontend.csv` must stay in sync.

## Sync command

After editing this file:

```bash
cp frontend/qa/QA_TEST_CHECKLIST.csv qa/frontend.csv
```

Or as part of a regen workflow run from workspace root, the mirror is refreshed alongside `MASTER.csv`.

---

**See also:** [../../qa/README.md](../../qa/README.md) for the full schema, status workflow, and master regen command.
