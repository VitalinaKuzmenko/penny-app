# Usability Roadmap — Transactions, Categories & Tags

Captured from a planning discussion on 2026-10-26. Bank sync is shelved;
imports stay manual via CSV upload (roughly every 1–2 months). Goal: make
the app useful beyond "look at charts, see nothing changed".

Steps are ordered so each builds on the previous one.

## Already done: edit transaction name during import

The import review table already has an editable description column
(`TransactionsTable.tsx`, inline `<input>`), and `ConfirmImportRowSchema`
accepts the edited `description`, which the server saves. The remaining gap
is editing **after** import, which Step 3 covers.

## Step 1: Last import date per account

Status: in review, PR #107 (branch `feature/account-last-import-date`).

Small change, no database migration.

- `GET /accounts` additionally returns per account:
  - `lastTransactionDate`: max `Transaction.date` (how far the data goes)
  - `lastImportedAt`: max `Transaction.createdAt` (when it was last imported)
  - Both come from a `groupBy` on `Transaction` by `accountId`.
- Extend the shared account schema in `packages/schemas` and the DTO in
  `packages/schemas-nest`.
- UI:
  - Upload CSV page: a list like _"HSBC: data up to 12 Sep (45 days ago),
    imported 14 Sep"_.
  - Account dropdown in the import review screen (`AccountSelect.tsx`):
    show the same info so gaps and overlaps are visible before saving.

## Step 2: Refunds reduce category spend

Added 2026-11-14. Example: clothes bought for £100, partly returned, £55
refunded → the app should show £45 spent on clothes.

### Problem (current behaviour)

- Import stores `|amount|` and sets `type` from the CSV sign: positive →
  `INCOME`, otherwise `EXPENSE` (`import.service.ts`, confirm import).
- In the import review table, positive rows can only be set to
  `Internal Transfer` or left without a category (`TransactionsTable.tsx`).
  So a refund is saved as uncategorised `INCOME`.
- Charts (`charts.service.ts`) only sum `EXPENSE` per category and treat
  every non-transfer `INCOME` as income. Result for the example:

  | | Shown now | Correct |
  |---|---|---|
  | Clothes | £100 | £45 |
  | Total expense | +£100 | +£45 |
  | Total income | +£55 | +£0 |
  | Savings (income − expense) | correct | correct |
  | Gauge (expense / income %) | wrong | — |

### Decisions (agreed 2026-11-14)

- New transaction type `REFUND` (approach "A", see alternatives below).
- A refund reduces spend in the month the **refund arrives**, not the
  month of the original purchase (no linking to the purchase).
- If refunds exceed spend for a category in a period, show **0**, not a
  negative number.
- Overall totals change too: refunds are removed from income and
  subtracted from expense (income vs expense chart, monthly stacked chart,
  gauge, and later the Transactions page totals in Step 3).
- Income itself stays uncategorised ("income is just income"). The design
  must not block adding income categories later.
- Existing data is **not** converted. Refunds imported before this step
  stay as `INCOME`; only refunds imported from this step onward count.
- Comes before the Transactions page: import + charts are enough on their
  own, since past refunds won't be fixed.
- On import, a positive row whose description matches a spending category
  in `CategoryMapping` is **pre-selected as a refund** in that category,
  shown with the existing "auto" chip so it's easy to spot and undo.
  Refunds are rare and every import is reviewed, so a wrong guess is cheap
  to fix; defaulting to income would repeat today's problem.

### Schema (needs a migration)

```prisma
enum TransactionType {
  INCOME
  EXPENSE
  REFUND
}
```

- Generated SQL is `ALTER TYPE "TransactionType" ADD VALUE 'REFUND';`.
  No data backfill.
- Add `'REFUND'` to `TransactionTypeSchema` in `packages/schemas/src/types.ts`.
- Deploy in the same order as the other migrations: back up, run
  `prisma migrate deploy` with the **prod** `DATABASE_URL` set explicitly,
  verify with `migrate status`, then deploy the server and the UI.

### Rule: how a positive amount gets its type

One rule, used on import now and reused by category edits on the
Transactions page (Step 3):

| CSV amount | Category chosen | Saved `type` |
|---|---|---|
| negative / 0 | any or none | `EXPENSE` (unchanged) |
| positive | none | `INCOME` |
| positive | `Internal Transfer` | `INCOME` (unchanged, still excluded) |
| positive | any other category | `REFUND` |

- `REFUND` always has a category; the server rejects a `REFUND` with no
  category.
- An `EXPENSE` can never become a `REFUND` (or the other way round); only
  rows that were positive in the CSV (`INCOME`/`REFUND`) switch type when
  their category changes.
- The transfer check uses the category name today; switch it to the
  `isTransfer` flag if `automation-roadmap.md` §4 lands first.

### Server

- Confirm import: apply the rule above instead of `amount > 0 ? INCOME :
  EXPENSE`.
- Duplicate detection rebuilds the signed amount as `EXPENSE` → negative,
  anything else → positive, so `REFUND` stays positive. Add a test so
  re-importing a CSV with a refund still matches it as a duplicate.
- `charts.service.ts`. Every chart must handle `REFUND` in the same PR,
  otherwise totals silently disagree between charts:
  - `getIncomeExpenseByYear`, `getIncomeExpenseRatio`: income = `INCOME`
    only; expense = `max(0, EXPENSE − REFUND)`. Savings are unchanged
    (refund leaves income and leaves expense by the same amount), except
    in the rare case where the clamp kicks in.
  - `getIncomeExpenseStacked`: same per month. Today the month bucket only
    has `INCOME`/`EXPENSE` keys, so a `REFUND` row would add to an
    undefined key; initialise it.
  - `getMonthlyCategoryChart` (chart + table): include `EXPENSE` and
    `REFUND`; per category per month = `max(0, expense − refunds)`.
  - `getCategoryBreakdown` with `type=EXPENSE`: per category over the range
    = `max(0, expense − refunds)`; drop categories that end at 0; `total`
    = sum of the shown slices so percentages add up to 100. With
    `type=INCOME`, refunds are excluded automatically by the type filter.
  - Because of the per-category clamp, the pie total can be slightly
    higher than the overall expense in the income/expense charts when a
    category has more refunds than spend in the period. Accepted.

### UI

- Import review table, positive rows: the category select offers
  - "Income (no category)" (default when there's no suggestion)
  - `Internal Transfer`
  - all other categories under a "Refund for…" heading.
  Show a small "refund" chip when one is chosen.
- Category auto-suggestion already runs on positive rows: `CategoryMapping`
  is keyed by description only, and `TransactionsClient.tsx` pre-fills
  `suggestedCategoryId` for every row. Today the select can't show that
  value on a positive row, but it's still sent on save, so some past
  income may be stored as `INCOME` with a spending category. Those rows are
  left as they are (still counted as income). With this step the
  suggestion becomes visible and pre-selects a refund (see Decisions).
  Choosing "Income (no category)" instead doesn't update the mapping, so
  the same merchant will be suggested as a refund again next time.
- Dashboard `TypeSelect`: add `Refund` if the type filter is used there.
- New strings: see open decision 4 (i18n).

### Alternatives considered

- **A′, no migration**: keep `INCOME` and treat "income with a non-transfer
  category" as a refund. Same UI and chart work, but every chart query
  needs extra category conditions, the meaning is hidden in the data, and
  it conflicts with income categories (e.g. Salary) if they're ever added.
  The only saving is a one-line migration, so not chosen.
- **B, link refund to the original purchase**: (`linkedTransactionId`, as
  in `automation-roadmap.md` §4) so the refund reduces the purchase month.
  More accurate, but the purchase is often in an earlier import and needs a
  matching UI. Not planned. It can be added on top of `REFUND` later.
- **Edit the purchase to £45 and delete the refund**: loses history, and
  re-importing the CSV would bring the refund back (dedupe can't match a
  deleted row). Rejected.

## Step 3: Transactions page (spreadsheet replacement)

New page, e.g. `/[lang]/transactions`, added to the Navbar.

### Server

- New `GET /transactions` endpoint (the existing `TransactionController`
  in `src/modules/transaction` has no routes yet). Filters:
  - date range (`from`, `to`)
  - `accountId[]`, `categoryId[]`, `type` (income/expense/refund)
  - `search` (description, case-insensitive)
  - `tagId[]` (once Step 5 is done)
  - pagination and sorting
- Response includes **totals for the whole filtered set**: count, total
  expense, total income, net. These must not be limited to the current page.
  Refunds follow Step 2: spent = `EXPENSE − REFUND`, income = `INCOME`
  only, net = income − spent.
- `PATCH /transactions/:id`: edit description and category.
- `PATCH /transactions/bulk`: set category for several transactions at once.
- Both PATCH endpoints: when the category changes on an `INCOME`/`REFUND`
  row, re-derive the type with the Step 2 rule (so a refund can be turned
  back into income and vice versa). `EXPENSE` rows never change type.
- All queries scoped by `userId`.

### UI

- Filter bar above the table with quick date presets (this month, last
  month, custom range) plus account, category, type and search filters.
- MUI X DataGrid (community, v8) with server-side pagination and sorting.
  The community version allows only one column filter at a time, so filters
  live in the custom bar rather than in the grid's built-in filter panel.
- Totals bar: count, spent, income, net for the current filter.
- Inline edit of description and category; select rows to change their
  category in one go.
- Refunds shown as a positive amount with a "refund" label; income/refund
  rows use the same category options as the import table (Step 2).
- New request functions in `apps/ui/src/requests` following the existing
  `'use server'` + `serverApiFetch` pattern.

## Step 4: Manage page for categories (plus accounts)

New page, e.g. `/[lang]/manage` (or a section in `/profile`).

### Categories

- Server currently only has `GET /categories`. Add:
  - `POST /categories`: create (name, optional colour/icon), unique per user
  - `PATCH /categories/:id`: rename / recolour
  - `DELETE /categories/:id`: see open decision below
- Charts exclude transfers by matching the category **name**
  `'Internal Transfer'` in `charts.service.ts`, so renaming that category
  breaks the exclusion. Either block renaming it or do the `isTransfer`
  flag from `automation-roadmap.md` §4 first.
- `CategoryMapping` rows reference categories, so they must be handled
  when a category is deleted (move to the replacement or delete them).

### Accounts

- `PATCH /accounts/:id`: rename. Show each account's last import info from
  Step 1 here too.

## Step 5: Tags

For grouping across categories, e.g. _"Spain trip 2026"_ spans Flights,
Hotels and Eating out.

### Schema (needs a migration)

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String
  color     String?
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id])
  transactions TransactionTag[]

  @@unique([userId, name])
}

model TransactionTag {
  transactionId String @map("transaction_id")
  tagId         String @map("tag_id")
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  tag           Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([transactionId, tagId])
  @@index([tagId])
}
```

Deploy using the same order as the dedupe migration: back up, run
`prisma migrate deploy` with the **prod** `DATABASE_URL` set explicitly,
verify with `migrate status`, then deploy the server and the UI.

### Server

- CRUD: `GET/POST /tags`, `PATCH/DELETE /tags/:id`.
- Assign/unassign tags on one or several transactions (bulk).
- `GET /transactions` supports `tagId[]`.

### UI

- Tag management on the Manage page from Step 4.
- Transactions page: select rows and add or remove a tag. Show tags as chips
  in a column and filter by tag; the totals bar then gives the event total.
- Optional later: assign tags during import.

## Open decisions

1. Order: start with Step 1 (smallest, no migration)?
2. Deleting a category that still has transactions: move them to a
   category the user chooses, or block the delete?
3. Assign tags during import as well, or only on the Transactions page to
   begin with?
4. i18n: add new strings to all of `en.json`, `ru.json`, `ua.json`, or
   English only for now?

## Later ideas (from the same discussion, not planned yet)

- "What changed" summary after each import: categories that moved compared
  with the 3- or 6-month average, new merchants, unusually large transactions.
- Recurring payments and subscriptions: annual cost, price increases,
  payments that stopped.
- Year-over-year view and a calendar of upcoming yearly bills.
- Savings rate and simple goals.
