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

Status: in progress (branch `feature/tags`).

### Decisions (agreed 2026-11-24)

- Tags are optional: a second way to group transactions next to categories.
- Tag edits follow the Money Journal flow: they're collected as unsaved
  changes and applied with Save.
- New tags are created **on Save** (and on import confirm), never on their
  own, so there is no `POST /tags`.
- Names are trimmed, 1–100 characters and unique per user **ignoring
  case**. If "Spain trip 2026" exists, "spain trip 2026" can't be created:
  the picker shows the existing tag instead of "Create tag …".
- Colour is assigned automatically from a fixed palette when a tag is
  created. Editing it comes with Step 5.
- Tags can be edited inline in a Tags cell or with Add tag / Remove tag in
  the bulk bar, both in the Money Journal and in the import review.
  - The cell is an autocomplete over the user's tags, plus
    _"Create tag 'X'"_ when nothing matches ignoring case.
  - Nothing is pre-filled. Tags are not remembered per description (unlike
    `CategoryMapping`), because they are usually one-off events.
- Money Journal filter: a tags multi-select plus "Untagged".
  - Several tags are combined with **OR** (any of them).
  - Nothing selected (the default and after Reset) means no tag filter.
  - The totals bar follows the filter, so it gives the event total.
- No sorting by tags.
- Deleted rows show their tags greyed out; tags can't be edited until the
  row is restored (same as description and category).
- Display: chips have a fixed max width with an ellipsis and a tooltip with
  the full name. A cell shows at most 2 chips, then "+N" with a tooltip
  listing the rest.
- Penny's View gets **no tag filter**. Instead there's a new "Spend by tag"
  horizontal bar chart:
  - it follows only the From/To dates;
  - spend per tag = `max(0, EXPENSE − REFUND)`; transfers and deleted rows
    are excluded;
  - a transaction with several tags counts in full under each of them, so
    there's no grand total;
  - tags with 0 spend are hidden; the tooltip shows the full name, the
    amount and the transaction count.
- Strings go into `en.json`, `ru.json` and `ua.json`.

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

- Plus `tags Tag[]` on `User` and `tags TransactionTag[]` on `Transaction`.
- Case-insensitive uniqueness is enforced in the service: a lookup with
  `mode: 'insensitive'` inside the same DB transaction.
  `@@unique([userId, name])` is only an exact-match backstop. A `citext`
  column was the alternative, but it needs a Postgres extension on prod.
- Deploy in the usual order: back up, run `prisma migrate deploy` with the
  **prod** `DATABASE_URL` set explicitly, verify with `migrate status`, then
  deploy the server and the UI.

### Shared schemas (`packages/schemas`, DTOs in `schemas-nest`)

- `TagSchema` (`id`, `name`, `color`) and `TagNameSchema` (trimmed, 1–100).
- `TagRef` = `{ id }` (existing tag) or `{ name }` (new tag).
- `TransactionChangeSchema`: `tags?: TagRef[]`, the row's **full desired
  set** (as `categoryId` is the desired value). A bulk "Add tag" just
  updates each selected row's set. It counts in the "Nothing to change"
  check.
- `ListTransactionsQuerySchema`: `tagIds`, `includeUntagged`.
- `TransactionListItemSchema`: `tags` (sorted by name).
- `ConfirmImportRowSchema`: `tags?: TagRef[]`.
- Chart query `{ startDate, endDate }` and response
  `{ tagId, name, color, spent, count }[]`.

### Server

- New `src/tags` module:
  - `GET /tags`: the user's tags, sorted by name ignoring case.
    `PATCH/DELETE /tags/:id` come with the Manage page in Step 5.
  - A shared helper resolves `TagRef`s inside the caller's DB transaction:
    - `{ id }` must belong to the user, otherwise 400
      `transactions.invalid_tag` / `import.invalid_tag`;
    - `{ name }` reuses a tag whose name matches ignoring case, or creates
      it with the next palette colour;
    - names are deduplicated within the request (first spelling wins).
- `GET /transactions`:
  - each row includes its tags;
  - tag filter =
    `OR [tags some tagId in tagIds, tags none (if includeUntagged)]`.
    `buildWhere` already uses `where.OR` for categories, so the two filters
    are combined with `AND` instead of overwriting each other.
- `PATCH /transactions`:
  - the deleted-row lock also covers `tags`;
  - inside the existing DB transaction: resolve refs, then per row delete
    links that are no longer in the set and `createMany` the new ones
    (`skipDuplicates`);
  - a tags-only change counts as updated and doesn't touch
    `CategoryMapping`.
- Confirm import: each inserted row gets its `id` up front (`randomUUID()`)
  so its tag links can be created right after `createMany`. Rows skipped as
  duplicates get no tags.
- `GET /charts/tag-spend?startDate&endDate`: tag links of the user's
  non-deleted, non-transfer `EXPENSE`/`REFUND` transactions in range,
  aggregated per tag in code (`max(0, expense − refund)`, count), with 0
  dropped and sorted by spend, highest first.
- Tests:
  - resolving refs: reuse ignoring case, dedupe within a request, foreign
    IDs rejected, palette colour;
  - update: set/replace/clear tags, deleted-row lock, tags-only change;
  - list: OR filter, Untagged, combined with the category filter;
  - import: tags saved on confirm, not on skipped duplicates, invalid tag
    → 400;
  - chart: clamp, transfers and deleted rows excluded, multi-tag rows
    counted in full, 0 hidden.

### UI

- Request functions `getTags` and `getTagSpend` use `clientApiFetch`; a
  `useTags` hook loads the tags on the client so they can be reloaded after
  Save.
- Shared components in `src/components`:
  - `TagChips`: truncation, tooltip, "+N"; unsaved new tags have a dashed
    border.
  - `TagPicker`: MUI `Autocomplete` (multiple).
    - Options are the user's tags plus new names already pending on the
      page.
    - It offers "Create tag 'X'" only when nothing matches ignoring case.
    - It limits names to 100 characters.
  - `TagCell`: chips plus an edit button that opens `TagPicker` in a
    popover, so rows keep the same height.
  - `BulkTagBar`: a second bar under the category bar with a `TagPicker`
    and Add tags / Remove tags. Several tags can be added or removed at
    once; Remove is only enabled when a chosen tag is on a selected row.
- Money Journal:
  - `PendingChange.tags`; `normaliseChange` drops it when the set equals
    the saved one; locked rows can't change tags.
  - Tags column (`sortable: false`) with `TagCell`.
  - The tag filter goes into `MoneyJournalFilters` and its filter context.
  - After Save, tags are refetched too, so new ones appear in the filter
    and picker.
  - Error message for `transactions.invalid_tag`.
- Import review (`TransactionsTable.tsx`, `TransactionsClient.tsx`):
  - Tags column with `TagCell` and `BulkTagBar` under the category bar;
  - `tags` sent on confirm;
  - error message for `import.invalid_tag`.
- Penny's View: `TagSpendChart` (recharts horizontal `BarChart`, tag
  colours, truncated labels with tooltip) at the bottom of
  `MainDashboard`, with an empty state when no tag has spend.

### Out of scope

- Renaming, recolouring and deleting tags (Step 5).
- Sorting by tags.
- A tag filter on Penny's View.
- Clicking a bar to open the Money Journal filtered by that tag (the
  journal has no URL params yet).

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

- Step 4 only adds `GET /tags`; tags are created when they're first
  assigned (there's no `POST /tags`).
- `PATCH /tags/:id`: rename / recolour (keep names unique per user,
  ignoring case, as in Step 4).
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

### Decisions (agreed 2026-11-24)

- A chip applies **immediately**; no Apply needed.
- Years run from the user's **first transaction** to the current year,
  every year in between included (even one without transactions).
- The Money Journal also gets an **"All time"** chip. Penny's View doesn't,
  because its year-based charts only show one year.
- **4** year chips on desktop/tablet, **2** on phones; see the mobile layout
  below.

### UI/UX

- A row of chips above the date pickers, in a shared `YearPresets`
  component (`src/components`) used by both filter bars. Desktop/tablet
  (`sm` and up):

  ```text
  Penny's View:   [ 2026 ]  [ 2025 ]  [ 2024 ]  [ 2023 ]  [ Older ▾ ]
  Money Journal:  [ 2026 ]  [ 2025 ]  [ 2024 ]  [ 2023 ]  [ Older ▾ ]  [ All time ]
  ```

  - Newest first; the current year comes first and is selected by default
    (both pages already open on this year).
  - Years before the 4 shown go into the "Older" menu (newest first), so
    the row doesn't grow every January. "Older" only appears when there
    are more years; a new user sees just the current year (plus "All time"
    in the Money Journal).
  - "All time" goes last: it's the broadest option and is used less often
    than a single year.

- Phones (`xs`, below 600px): **2 year chips**, the rest in "Older":

  ```text
  Penny's View:   [ 2026 ]  [ 2025 ]  [ Older ▾ ]
  Money Journal:  [ 2026 ]  [ 2025 ]  [ Older ▾ ]  [ All time ]
  ```

  - A 360px phone leaves about 328px for the row. Two years + "Older" +
    "All time" fit on one line (about 290px); four years would need a
    second line or sideways scrolling, and a hidden scrolled chip is easy
    to miss.
  - The last two years cover most visits, so the rest can sit in "Older".
  - Both pages show the same number of years so they feel the same.
  - Chips stay at MUI's default size, which is large enough to tap.

- When the selected year is inside "Older", that chip shows the year and
  is highlighted (e.g. `[ 2019 ▾ ]`), so the current selection is always
  visible without opening the menu.
- Clicking a year sets From = 1 Jan and To = 31 Dec of that year and
  applies straight away. Other changed-but-not-applied filters are applied
  with it, since there is only one "applied" state.
  - Money Journal: this goes through the existing "Discard unsaved
    changes?" prompt, like Apply.
- "All time" (Money Journal) clears From and To, so the request has no
  date filter, and applies straight away. The empty pickers show that no
  date limit is set.
- A chip is highlighted when the applied range is exactly that year (or
  empty for "All time"). Editing the pickers to anything else clears the
  highlight, so the pickers stay the "custom range" option without an
  extra chip.
- Reset goes back to the current year, as today.
- Strings for "Older", "All time" and the chip tooltip
  ("1 Jan – 31 Dec 2025") in en, ru and ua.

### Server

- Years need the user's first transaction date. Add
  `firstTransactionDate` to `GET /accounts` next to `lastTransactionDate`
  from Step 1: the same `groupBy`, plus `_min: { date }`, skipping deleted
  rows. No new endpoint; the UI takes the earliest date across accounts.
- Extend `AccountWithActivitySchema` in `packages/schemas`.

## Open decisions

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
3. ~~Assign tags during import as well, or only on the Transactions page to
   begin with?~~ Both, in Step 4 (decided 2026-11-24).
4. ~~i18n: add new strings to all of `en.json`, `ru.json`, `ua.json`, or
   English only for now?~~ All three (decided 2026-11-24).

## Later ideas (from the same discussion, not planned yet)

- "What changed" summary after each import: categories that moved compared
  with the 3- or 6-month average, new merchants, unusually large transactions.
- Recurring payments and subscriptions: annual cost, price increases,
  payments that stopped.
- Year-over-year view and a calendar of upcoming yearly bills.
- Savings rate and simple goals.
