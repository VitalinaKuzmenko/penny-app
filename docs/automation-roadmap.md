# Automation Roadmap — Import & Categorisation

Captured from a planning discussion on 2026-09-12. Priority order as agreed;
each item is independent and can be picked up on its own.

## 1. Bank connection (Open Banking sync) — highest value, provider confirmed

Replaces manual CSV download/upload entirely, including the HSBC 1.5-month
PDF-only export limitation (sync gives full history at consent time, then
incremental pulls after).

- **Provider: Enable Banking — confirmed free for personal use** (2026-09-12).
  Constraint: free tier only works with accounts the developer registers/owns
  ("defined accounts") — fine for a single-user personal project, but means
  this can't be opened up to arbitrary third-party users without moving to a
  paid plan later.
- Schema: `Account` gains `provider`, `externalAccountId`, `consentId`,
  `consentExpiresAt`.
- Flow: scheduled/on-demand job pulls new transactions per connected account
  and writes them into a `PENDING TransactionImport` + rows, reusing the
  existing `/import/:importId/transactions` review screen unchanged.
- Consent renews periodically (per-bank `maximum_consent_validity`, returned
  by `GET /aspsps`; often several months but bank-specific) — needs a
  "Reconnect" banner when a connection expires.
- Fallback: CSV upload stays as-is for accounts/banks not connected.

### What "only my defined accounts" actually means (confirmed from API docs)

Enable Banking apps run in one of two environments, chosen at registration
and **not changeable later**:

- `SANDBOX` — auto-activated instantly, free, but only talks to Enable
  Banking's fake test banks. Not useful for real HSBC/Starling/Capital One
  data.
- `PRODUCTION` — real banks, but a newly registered production app starts
  `pending`. It's activated one of two ways: (a) commercial/contractual
  agreement with Enable Banking, **or** (b) whitelisting specific accounts
  in their Control Panel — confirmed by the `NO_ACCOUNTS_ADDED` error
  ("No allowed accounts added to the application") and the app-registration
  docs, which explicitly mention this path as an alternative to contracts.

So "free for personal use" = a `PRODUCTION` app where _only the specific
accounts we whitelist ourselves_ (our own HSBC/Starling/Capital One
accounts) are allowed to connect — it cannot be opened to other users
without a commercial agreement. That's a non-issue for a single-user
personal project, but rules out ever exposing this to friends/family
without upgrading later.

### API shape (confirmed from docs, useful for implementation)

- **Auth**: generate an RSA keypair + self-signed cert, upload via Control
  Panel or `POST /applications` → get `app_id`. Every API call needs an
  `Authorization: Bearer <JWT>` signed with that private key (`RS256`,
  `kid` = app_id, max TTL 24h).
- **Connect flow**: `GET /aspsps?country=GB` to list banks (confirms HSBC/
  Starling/Capital One availability) → `POST /auth` (specify account
  access scope + `valid_until`) → redirect user to bank login → bank
  redirects back with a `code` → `POST /sessions` with that code → returns
  `session_id` + list of `AccountResource` (each with a `uid` used for
  subsequent calls).
- **Fetching data**: `GET /accounts/{uid}/transactions?date_from=&date_to=`
  — paginated via `continuation_key`; each `Transaction` has
  `entry_reference` (stable id, good dedupe candidate alongside/in place of
  our own fingerprint), `transaction_amount`, `remittance_information`
  (description lines), `booking_date`/`value_date`, `credit_debit_indicator`.
- **Sessions expire** per the bank's consent terms; `DELETE /sessions/{id}`
  revokes early. No dedicated "refresh" call — re-run the `POST /auth` flow
  when consent lapses (drives the "Reconnect" banner mentioned above).
- Official pricing page wasn't reachable (404) — the free/whitelisted-account
  model above comes from the technical docs (error codes + app registration
  flow), not a pricing page. Confirm exact cost (if any) once signed into
  their Control Panel / sales contact, since only the "how it works
  technically" side is verifiable from public docs.

## 2. Duplicate detection — ✅ done (2026-09-12)

Prevents re-importing the same transactions when export date ranges overlap
(important once imports happen monthly instead of every 3 months) **and**
makes it safe to repeatedly test the Enable Banking sync (#1) without
polluting real transaction history — every sync run/test hits the same
confirm path, so dedupe needed to exist before that work starts.

Implemented:

- `Transaction.fingerprint` = `sha256(date, |amount|, normalised description)`,
  computed in `apps/server/src/utils/transaction-fingerprint.ts`. Nullable +
  `@@unique([accountId, fingerprint])` (migration
  `20260912142826_add_transaction_fingerprint`).
- `confirmImport` (`import.service.ts`) computes each row's fingerprint
  against the chosen `accountId`, skips rows that already exist (checked
  against the DB, and also against duplicates within the same upload batch),
  and inserts with `skipDuplicates: true` as a final safety net. Returns
  `{ skippedDuplicates }`.
- `GET /import/:importId/rows` accepts an optional `?accountId=` query param
  and, once an account is known, flags each row with `duplicate: boolean`
  plus `duplicateOf: { date, amount, description }` — the existing
  transaction it matched, so the user can judge whether it's a real
  re-import or a legitimate repeat.
- Confirm rows accept `forceImport?: boolean`; the server skips a row only
  when `duplicate && !forceImport`. `skippedDuplicates` is still returned
  (useful for logging) but the UI no longer relies on it.

### ⚠️ Production deploy checklist for this PR (#105)

Two Prisma migrations must be applied to the **production** database. Both
are safe on live data and take milliseconds on a table this size:

| Migration                                                 | What it does                                                                           | Risk                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `20260912142826_add_transaction_fingerprint`              | `ADD COLUMN fingerprint TEXT` (nullable) + unique index on `(account_id, fingerprint)` | None — all existing rows get `NULL`, and Postgres treats NULLs as distinct in unique indexes, so it cannot fail on existing data |
| `20260912143556_relax_transaction_fingerprint_uniqueness` | Drops that unique index, creates a plain index in its place                            | None                                                                                                                             |

Order of operations (do **not** start the new server build before the
migrations have run — the new code writes `fingerprint` on every confirm and
will 500 if the column is missing):

1. Back up the prod DB (or confirm the platform snapshot is recent).
2. Run migrations against prod, from `apps/server`, with the **prod**
   connection string explicitly set:
   ```bash
   DATABASE_URL="postgresql://…prod…" pnpm prisma migrate deploy
   ```
   Do **not** use `make prisma-migrate-deploy` without overriding
   `DATABASE_URL` — the Makefile defaults it to the local docker DB
   (`test_user@localhost:5432/penny`), so it would silently migrate the wrong
   database and report success.
3. Verify:
   ```bash
   DATABASE_URL="postgresql://…prod…" pnpm prisma migrate status
   ```
   Expect `Database schema is up to date!` and both migration names listed
   as applied.
4. Deploy the new server build. `prisma generate` is part of the build, so
   the client already knows about `fingerprint`.
5. Deploy the UI (new `duplicate` / `duplicateOf` / `forceImport` fields
   are additive; old UI against new server still works, new UI against old
   server would show no duplicate flags but not break).
6. Smoke test: upload a CSV you've imported before → pick the same account →
   rows should be flagged "Duplicate" before you save.

Existing transactions keep `fingerprint = NULL` and are therefore **never**
matched as duplicates of a new import. Only rows confirmed after this deploy
participate in dedupe — unless you run the backfill below.

7. **Backfill historical fingerprints** (optional, recommended). Computes
   `fingerprint` for every existing row using the exact same function the
   import flow uses, so old and new rows compare identically. Idempotent —
   only touches `fingerprint IS NULL`, safe to re-run. Batched (500/tx).
   ```bash
   cd apps/server
   # dry run — prints host, row count and a sample; writes nothing
   DATABASE_URL="postgresql://…prod…" pnpm backfill:fingerprints
   # write. --remote is required for any non-localhost host, on purpose.
   DATABASE_URL="postgresql://…prod…" pnpm backfill:fingerprints --apply --remote
   ```
   Or for the local docker DB: `make backfill-fingerprints` (dry run) /
   `make backfill-fingerprints APPLY=1`.
   Script: `apps/server/scripts/backfill-fingerprints.ts`. As of 2026-09-12
   prod had 4,870 rows without a fingerprint.

> ⚠️ `apps/server/.env` currently points `DATABASE_URL` at **Supabase (prod)**
> with the localhost line commented out (done to check `migrate status` on
> prod). Anything that reads `.env` — `make dev`, `prisma migrate dev`,
> `pnpm backfill:fingerprints` without an explicit `DATABASE_URL` — will hit
> prod until it's switched back. The backfill refuses `--apply` on a
> non-local host without `--remote` for exactly this reason.

### Correction (2026-09-12): false-positive risk found and fixed

Original design used a hard `@@unique([accountId, fingerprint])` DB
constraint plus an "exists at all" check. That's wrong: two **genuinely
different** transactions with the same date/amount/description (e.g. two
identical £3.50 coffees on the same day) would collide — the DB constraint
would make it structurally impossible to ever store both, and the app logic
would silently skip the second one as if it were a re-import.

Fixed by:

- Dropping the unique constraint in favour of a plain
  `@@index([accountId, fingerprint])` (migration
  `20260912143556_relax_transaction_fingerprint_uniqueness`) — the DB no
  longer blocks legitimate repeats.
- Switching both `getImportRows` and `confirmImport` to **count-based**
  matching: a row is only treated as a duplicate if fewer identical
  fingerprints have already been "consumed" (existing DB rows + earlier
  rows in the same batch) than the number of existing matches. E.g. 2
  identical existing transactions + 3 new identical rows in a fresh import →
  first 2 are skipped as duplicates, the 3rd is inserted as genuinely new.
- Frontend: the post-save duplicate notice no longer auto-redirects after
  2s (easy to miss) — it now stays visible with an explicit "Continue"
  button. (Superseded the same day by the pre-save review below.)

### Pre-save duplicate review (2026-09-12) — replaces the post-save banner

Agreed principle: the user must be able to see _which_ rows are duplicates,
_why_ (what they matched), and decide per row — before anything is saved.
A "4 were skipped, trust us" summary after the fact is not acceptable.

Flow as implemented in `TransactionsClient` / `TransactionsTable` /
`DuplicatesBar`:

- Duplicates are computed per account, so nothing is flagged until an
  account is chosen. On `accountId` change the client re-fetches
  `GET /import/:id/rows?accountId=` and swaps in the flagged rows; any
  previous force-import choices are reset.
- Each duplicate row shows a "Duplicate" chip with a tooltip of the matched
  existing transaction (date · amount · description), an **Import anyway**
  checkbox (off by default), and is rendered muted + struck-through while
  skipped so it reads as "won't be imported" without hiding it.
- A warning bar above the table summarises "N possible duplicate(s) found —
  skipped by default" with **Skip all** / **Import all anyway** bulk actions.
- Skipped rows don't need a category and don't block Save. Opting a row back
  in makes it a normal row again (category rule applies).
- Save button is honest: "Save 12 transaction(s) (4 skipped)". After save
  the user goes straight to the dashboard — no post-save banner.
- Default is **skip**, not import: the primary case is overlapping exports
  (HSBC window), and a wrong skip (one missing coffee) costs less than a
  wrong import (double-counted rent). The user overrides per row when they
  know better.
- Honest limit: same-day identical items are inherently ambiguous. The app
  shows the evidence (the matched transaction) and lets the human decide; it
  does not pretend to know.

## 3. Habit nudges — nice to have, low effort

- `Account.lastTransactionDate` (derived or cached) shown on the
  accounts/dashboard view: _"HSBC — last data 31 days ago → Import"_.
- Scheduled job (`@nestjs/schedule`) to delete `PENDING` `TransactionImport`
  rows older than 14 days (currently they persist forever).

## 4. Internal Transfer handling — low priority, refine later

Current behaviour: chart exclusion matches by category **name**
(`'Internal Transfer'` string in `charts.service.ts`), fragile to renames/
locale.

Agreed direction — flag **plus** linking, not flag alone:

- Add `Category.isTransfer: Boolean` — replaces name-string matching in
  chart queries.
- Add `Transaction.linkedTransactionId` (nullable, self-relation) to pair
  the outgoing (`EXPENSE`) and incoming (`INCOME`) legs of a transfer
  between two of the user's own accounts.
- Auto-detection (most useful once #1 lands and multiple accounts sync):
  match an unpaired `EXPENSE` on account A with an unpaired `INCOME` on
  account B, same user, matching (or near-matching) amount, dates within a
  few days → suggest a one-click link that tags both sides as transfer
  instead of categorising each leg manually.
- Linking is additive: a row can still be manually marked as
  `Internal Transfer` with no linked pair (e.g. the other side isn't a
  tracked account), same as today.

## 5. Test coverage — started 2026-09-12

First real unit tests in `apps/server` (previously only `it('should be
defined')` stubs). Run with `npx jest <path>` from `apps/server`; note that
`pnpm test -- --testPathPattern=…` mangles the argument.

- `src/utils/transaction-fingerprint.spec.ts` — fingerprint is deterministic,
  normalises case/whitespace/sign/precision, sensitive to date/amount/
  description, uses the UTC calendar day.
- `src/utils/parse-date.spec.ts` — every supported format, disambiguation
  rules, rollover rejection.
- `src/import/import.service.spec.ts` — `getImportRows` (ownership, per-
  account flagging, `duplicateOf`, count-based matching, category
  suggestion) and `confirmImport` (error cases, insert shape, skip-by-
  default, `forceImport` override, count-based skip, no-op insert,
  edited-description fingerprint, category mapping upsert). Prisma is
  mocked; no DB needed.

### Bug found by the tests: `parseDate` alone returned US month order

`parseDate` tried `new Date(value)` **first** and only fell back to the
explicit DD/MM/YYYY logic if that failed. V8 parses `"07/03/2025"` as US
**July 3**, so on its own the function returned the wrong month for any
slash date with day ≤ 12. `25/12/2025` was fine only because month 25 makes
the native parse fail.

**Correction (same day):** this did **not** corrupt existing DD/MM data.
`importCsv` calls `parseDate` twice — once to validate, then
`formatDateToString` (→ `DD/MM/YYYY`), then `parseDate` again on that
string before insert. The second native parse swapped day/month back, so
two wrongs made a right for UK-format CSVs:

| CSV          | 1st parse | formatted    | 2nd parse → stored |
| ------------ | --------- | ------------ | ------------------ |
| `05/01/2025` | May 1 ✗   | `01/05/2025` | Jan 5 ✅           |
| `2025-01-05` | Jan 5 ✓   | `05/01/2025` | May 1 ❌           |

So the real, narrower impact was: **ISO-dated CSVs** with day ≤ 12 were
stored swapped. UK-format exports (HSBC etc.) were stored correctly by
accident. Verified against the local DB — rows imported as `05/01/2025`
are stored as `2025-01-05`.

Fixed: numeric `D/M/Y`-shaped strings now always go through the explicit
parser; the native parser is only used for other shapes (full ISO
timestamps etc.). `parseDate` is now correct on a single call, which
matters because the Enable Banking sync will call it once, not twice.
Regression tests added.

Follow-ups (low priority): remove the redundant second `parseDate` in
`importCsv` (the intermediate string only exists to satisfy
`CsvRowSchema`'s string `date`); if anyone ever imported ISO-dated CSVs,
those rows with day ≤ 12 need checking — not the case for the current user.

### Known latent inconsistency (not fixed, low risk for a UK user)

`parseDate` returns **local** midnight for D/M/Y input but the native parser
returns **UTC** midnight for ISO input. The fingerprint uses the UTC calendar
day, so the same logical date could fingerprint differently if a user
switches CSV date formats between exports (e.g. during BST). Consistent
within a single format, so dedupe works today. Cleanest fix later: make
`parseDate` always return `Date.UTC(y, m-1, d)`.

Pre-existing failing skeleton specs (`app.controller`, `auth.*`,
`users.service`) are unrelated to this work — they fail because they don't
provide the dependencies those classes inject. Worth fixing or deleting.

## Already resolved / no work needed

- **JWT expiry**: already `24h` in both `auth.module.ts` (`signOptions.expiresIn`)
  and the cookie `maxAge` (`JWT_COOKIE_MAX_AGE_MS` in `auth.controller.ts`) —
  the 1h/24h mismatch noted in `PROJECT_ANALYSIS.md` no longer applies.
- **"Apply category to all similar" / merchant grouping**: superseded by the
  existing manual workflow (filter `description` column → select rows →
  bulk-apply category) plus the already-built "Rule-from-filter" —
  saving a filter as a reusable category rule. No further UI needed here.

## Explicitly discussed but not planned

- Merchant-key normalisation + grouped review UI (regex-based description
  cleanup to group `TESCO STORES 3201` / `TESCO STORES 4410` etc.) — dropped
  in favour of the simpler, already-existing filter + Rule-from-filter
  workflow, which achieves the same outcome with far less complexity and
  lower risk of wrongly merging distinct merchants.
