# Usability Roadmap — Transactions, Categories & Tags

Captured from a planning discussion on 2026-10-26. Bank sync is shelved;
imports stay manual via CSV upload (roughly every 1–2 months). Goal: make
the app useful beyond "look at charts, see nothing changed".

Steps are ordered so each builds on the previous one.

## Already done: edit transaction name during import

The import review table already has an editable description column
(`TransactionsTable.tsx`, inline `<input>`), and `ConfirmImportRowSchema`
accepts the edited `description`, which the server saves. The remaining gap
is editing **after** import, which Step 2 covers.

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

## Step 2: Transactions page (spreadsheet replacement)

New page, e.g. `/[lang]/transactions`, added to the Navbar.

### Server

- New `GET /transactions` endpoint (the existing `TransactionController`
  in `src/modules/transaction` has no routes yet). Filters:
  - date range (`from`, `to`)
  - `accountId[]`, `categoryId[]`, `type` (income/expense)
  - `search` (description, case-insensitive)
  - `tagId[]` (once Step 4 is done)
  - pagination and sorting
- Response includes **totals for the whole filtered set**: count, total
  expense, total income, net. These must not be limited to the current page.
- `PATCH /transactions/:id`: edit description and category.
- `PATCH /transactions/bulk`: set category for several transactions at once.
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
- New request functions in `apps/ui/src/requests` following the existing
  `'use server'` + `serverApiFetch` pattern.

## Step 3: Manage page for categories (plus accounts)

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

## Step 4: Tags

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

- Tag management on the Manage page from Step 3.
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
