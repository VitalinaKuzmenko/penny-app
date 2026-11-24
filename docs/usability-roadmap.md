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

Status: done, PR #107 merged.

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

Status: in progress (branch `feature/refunds-reduce-category-spend`).

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

  |                            | Shown now | Correct |
  | -------------------------- | --------- | ------- |
  | Clothes                    | £100      | £45     |
  | Total expense              | +£100     | +£45    |
  | Total income               | +£55      | +£0     |
  | Savings (income − expense) | correct   | correct |
  | Gauge (expense / income %) | wrong     | —       |

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

| CSV amount   | Category chosen     | Saved `type`                         |
| ------------ | ------------------- | ------------------------------------ |
| negative / 0 | any or none         | `EXPENSE` (unchanged)                |
| positive     | none                | `INCOME`                             |
| positive     | `Internal Transfer` | `INCOME` (unchanged, still excluded) |
| positive     | any other category  | `REFUND`                             |

- `REFUND` always has a category: the rule only produces `REFUND` when a
  category is chosen.
- An `EXPENSE` can never become a `REFUND` (or the other way round); only
  rows that were positive in the CSV (`INCOME`/`REFUND`) switch type when
  their category changes.
- The transfer check uses the category name today; switch it to the
  `isTransfer` flag if `automation-roadmap.md` §4 lands first.

### Server

- Confirm import: apply the rule above instead of `amount > 0 ? INCOME :
EXPENSE`. It loads the submitted categories scoped by `userId` and
  rejects IDs the user doesn't own (`import.invalid_category`, 400).
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
    `REFUND`; per category per month = `max(0, expense − refunds)`;
    categories that end at 0 for the whole year are dropped.
  - `getCategoryBreakdown` with `type=EXPENSE`: per category over the range
    = `max(0, expense − refunds)`; drop categories that end at 0; `total`
    = sum of the shown slices so percentages add up to 100. With
    `type=INCOME`, refunds are excluded automatically by the type filter.
  - Because of the per-category clamp, the pie total can be slightly
    higher than the overall expense in the income/expense charts when a
    category has more refunds than spend in the period. Accepted.

### UI

- Import review table, positive rows: the category select offers
  - "None, just income" (existing label; default when there's no
    suggestion)
  - `Internal Transfer`
  - all other categories under a "Refund for…" heading.
    Show a small "refund" chip when one is chosen.
- The bulk category bar applies to every selected row; on a positive row
  a spending category makes it a refund (same rule).
- Category auto-suggestion already runs on positive rows: `CategoryMapping`
  is keyed by description only, and `TransactionsClient.tsx` pre-fills
  `suggestedCategoryId` for every row. Today the select can't show that
  value on a positive row, but it's still sent on save, so some past
  income may be stored as `INCOME` with a spending category. Those rows are
  left as they are (still counted as income). With this step the
  suggestion becomes visible and pre-selects a refund (see Decisions).
  Choosing "None, just income" instead doesn't update the mapping, so
  the same merchant will be suggested as a refund again next time.
- Dashboard `TypeSelect`: not changed. Its value is stored in
  `FilterContext` but no chart reads it yet, so a `Refund` option would do
  nothing.
- New strings added to `en.json`, `ru.json` and `ua.json`. Chart tooltips
  are unchanged.

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

## Step 3: Money Journal (transactions page, spreadsheet replacement)

Status: done, PR #110 merged.

New page `/[lang]/money-journal` ("Money Journal"; ru "Денежный журнал",
ua "Грошовий журнал"), in the Navbar between Upload CSV and Penny's View.

### Decisions (agreed 2026-11-24)

- Totals cover the whole filtered set, never just the page:
  - spent = `EXPENSE − REFUND`, **not clamped**, so it can be negative;
  - income = `INCOME`;
  - net = income − spent;
  - count = number of transactions.
- **Internal transfers are included** in the totals and currencies are
  summed together, so the numbers can differ from Penny's View, which
  leaves transfers out and clamps at 0. A tooltip on the totals bar says so.
- Editing a description keeps the original dedupe `fingerprint`, so
  re-importing the same CSV still finds it. Empty descriptions are rejected;
  there is no length limit.
- A category can be cleared. An `INCOME`/`REFUND` row then becomes
  `INCOME`; `EXPENSE` rows never change type (Step 2 rule).
- Category changes (single and bulk) update `CategoryMapping` like import,
  keyed by the current description. Clearing a category doesn't touch it.
  A renamed row maps its new name, which won't match future CSV rows.
- Deleting is a **soft delete** (`Transaction.deletedAt`):
  - deleted rows are hidden everywhere (charts, account activity, totals)
    but still count as duplicates on import, so they don't come back;
  - the import review labels such matches "Previously deleted";
  - a "Show deleted" switch lists them greyed out with a Restore action
    (single row);
  - a deleted row must be restored before it can be edited.
- Expenses without a category show as an "Uncategorised" slice/series in
  the dashboard's category charts (they used to crash them). When every
  category is selected, the monthly chart sends no category filter so the
  series appears there too.

### Schema (needs a migration)

```prisma
model Transaction {
  // ...
  deletedAt DateTime? @map("deleted_at")
}
```

Generated SQL: `ALTER TABLE "Transaction" ADD COLUMN "deleted_at" TIMESTAMP(3);`.
No backfill. Deploy in the usual order: back up, run
`prisma migrate deploy` with the **prod** `DATABASE_URL` set explicitly,
verify with `migrate status`, then deploy the server and the UI.

### Server

- New `src/transactions` module; the unused `src/modules/transaction` stub
  was removed. Zod schemas live in `packages/schemas`.
- `GET /transactions` query:
  - `from`, `to` (`YYYY-MM-DD`, whole UTC days)
  - `accountIds`, `categoryIds` (comma-separated, like the chart queries)
  - `includeUncategorised`
  - `type` (`INCOME`/`EXPENSE`/`REFUND`)
  - `search` (description, case-insensitive)
  - `includeDeleted`
  - `page`, `pageSize` (25/50/100)
  - `sortField` (`date`/`category`/`account`), `sortOrder`
  - `tagIds` comes in Step 4.
  - Category sort puts uncategorised rows last in both directions.
- Response: `rows`, `rowCount` (drives paging; includes deleted rows when
  shown) and `totals` (deleted rows never counted).
- `PATCH /transactions`: one all-or-nothing request with a list of
  `{ id, description?, categoryId? (null clears), deleted? }`.
  - This replaces the planned `PATCH /transactions/:id` and
    `PATCH /transactions/bulk`, because edits are collected and saved together.
  - No size limit.
  - Unknown/foreign IDs → 404 `transactions.not_found`.
  - Foreign categories → 400 `transactions.invalid_category`.
  - Editing a deleted row → 400 `transactions.deleted_not_editable`.
- All queries scoped by `userId`.

### UI

- Filters follow Penny's View: a `MoneyJournalFilterProvider` in the page
  layout holds a draft and applied filters (Apply / Reset), with no URL
  params and no date presets.
  - From/To pickers default to this year.
  - Type: All/Income/Expense/Refund.
  - Categories (all selected + "Uncategorised"), accounts (all selected).
  - Search and "Show deleted".
  - Everything or nothing selected means no filter.
- Totals bar: count, spent, income, net.
- MUI X DataGrid (community, v8), server-side paging (25 by default) and
  sorting on date (newest first), category and account.
  - Columns: date, description, signed coloured amount, type, category,
    account, currency and a delete/restore action.
- Edits are explicit:
  - description, category, delete and restore are collected as unsaved
    changes, then applied with Save or Discard;
  - paging, sorting or Apply with unsaved changes asks "Discard unsaved
    changes?", and the browser warns before leaving;
  - after saving, the table refetches, so rows that no longer match the
    filters drop out.
- Select rows to set (or clear) their category or delete them. The bulk bar
  and the category cell select are shared with the import page
  (`src/components`).
- Request functions use `clientApiFetch`, like Penny's View charts, so
  server error codes reach the page. (The plan said `'use server'` +
  `serverApiFetch`.)
- Strings added to `en.json`, `ru.json` and `ua.json`.
- Known gap: client-side navigation via the Navbar doesn't trigger the
  unsaved-changes warning (same as the import page).

## Step 4: Tags

For grouping across categories, e.g. _"Spain trip 2026"_ spans Flights,
Hotels and Eating out.

Comes right after the Transactions page (decided 2026-11-24): tags are
assigned by selecting rows there and the event total comes from its totals
bar, so tags are of little use before Step 3 exists. They don't need the
Manage page, though: tags are created inline, and full tag management moves
to Step 5.

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

- `GET /tags` and `POST /tags` (name, optional colour), unique per user.
  `PATCH/DELETE /tags/:id` come with the Manage page in Step 5.
- Assign/unassign tags on one or several transactions (bulk).
- `GET /transactions` supports `tagIds`.

### UI

- Transactions page: select rows and add or remove a tag. The tag picker is
  an autocomplete that also offers _"Create tag 'Spain trip 2026'"_, so
  tags are created and assigned in one go without a separate page.
- Show tags as chips in a column and add a tag filter to the filter bar;
  the totals bar then gives the event total.
- Optional later: assign tags during import.

## Step 5: Manage page for categories, tags and accounts

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

### Tags

- `PATCH /tags/:id`: rename / recolour (keep names unique per user).
- `DELETE /tags/:id`: removes the tag from its transactions
  (`TransactionTag` rows cascade); the transactions themselves stay.

### Accounts

- `PATCH /accounts/:id`: rename. Show each account's last import info from
  Step 1 here too.

## Step 6: Year presets on Penny's View and the Money Journal

Added 2026-11-24. One-click year filters on both pages, so the usual
question ("how did 2025 go?") doesn't need two date pickers. Small, no
migration, and independent of Steps 4–5, so it can be done at any time.
This reverses the Step 3 decision to have no date presets.

### Why it fits

- Penny's View is already year-based: the income/expense chart and the
  monthly category chart/table use `startDate.year()`, so a range that
  spans two years only shows the start year there. Picking a whole year is
  what the page expects anyway.
- The Money Journal defaults to "this year" too, and its totals bar then
  becomes a yearly summary.

### UI/UX (proposal)

- A row of year chips above the date pickers, in a shared
  `YearPresets` component (`src/components`) used by both filter bars:

  ```text
  [ 2026 ]  [ 2025 ]  [ 2024 ]  [ 2023 ]  [ Older ▾ ]      From [01/01/2026]  To [31/12/2026]
  ```

  - Newest first; the current year comes first and is selected by default
    (the pages already open on this year).
  - Only years from the user's first transaction to the current year
    (no empty years before the data starts). A new user sees just the
    current year.
  - At most 4 chips; older years go into an "Older" menu so the row
    doesn't grow every January. On mobile the row scrolls sideways.

- Clicking a chip sets From = 1 Jan and To = 31 Dec of that year and
  **applies straight away** (a preset that still needs Apply feels broken).
  Other changed-but-not-applied filters are applied with it.
  - Money Journal: this goes through the existing "Discard unsaved
    changes?" prompt, like Apply.
- The chip is highlighted when the applied range is exactly that year.
  Editing the pickers to anything else clears the highlight, so the
  pickers stay the "custom range" option without an extra chip.
- Reset goes back to the current year, as today.
- Strings for "Older" and the chip tooltip ("1 Jan – 31 Dec 2025") in en,
  ru and ua.

### Server

- Years need the user's first transaction date. Add
  `firstTransactionDate` to `GET /accounts` next to `lastTransactionDate`
  from Step 1: the same `groupBy`, plus `_min: { date }`, skipping deleted
  rows. No new endpoint; the UI takes the earliest date across accounts.
- Extend `AccountWithActivitySchema` in `packages/schemas`.

### Open decisions

1. Apply a chip immediately (proposed) or only fill the pickers and wait
   for Apply, like the other filters?
2. Show every year from the first transaction (proposed), or skip years
   with no transactions in between?
3. Money Journal only: also offer "All time" (useful for searching every
   transaction by name), or keep the two pages identical?
4. How many year chips before "Older" (proposed 4)?

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
