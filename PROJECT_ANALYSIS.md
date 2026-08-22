# Penny App — Project Analysis

> Scanned: August 2026. This document covers the full monorepo.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Module Breakdown](#3-module-breakdown)
   - 3.1 [Backend (NestJS)](#31-backend-nestjs)
   - 3.2 [Frontend (Next.js)](#32-frontend-nextjs)
   - 3.3 [Shared Packages](#33-shared-packages)
4. [Data Model](#4-data-model)
5. [Auth Flow](#5-auth-flow)
6. [CSV Import Flow](#6-csv-import-flow)
7. [Critical Issues 🔴](#7-critical-issues-)
8. [Good-to-Have Improvements 🟡](#8-good-to-have-improvements-)
9. [What's Done Well ✅](#9-whats-done-well-)

---

## 1. Project Overview

Penny App is a personal finance tracker. Users upload CSV exports from their bank, assign categories to transactions, and get aggregated charts (monthly breakdown, income vs expense, category pie). There is no direct bank integration — the app works with any bank's CSV export.

Live site: **https://www.pennyapp.co.uk**

---

## 2. Architecture & Tech Stack

```
penny-monorepo/
├── apps/
│   ├── server/          ← NestJS API
│   └── ui/              ← Next.js frontend
└── packages/
    ├── schemas/         ← shared Zod schemas + TypeScript types
    └── schemas-nest/    ← NestJS-compatible DTOs (wrap schemas/)
```

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Frontend        | Next.js 16 (App Router), React 19, TypeScript           |
| UI Library      | Material UI v7 (MUI), Recharts                          |
| Backend         | NestJS 10, TypeScript                                   |
| ORM             | Prisma 7 (with `@prisma/adapter-pg`)                    |
| Database        | PostgreSQL 16                                           |
| Auth            | JWT (HTTP-only cookie) + Google OAuth 2.0 (Passport.js) |
| Validation      | Zod (shared), class-validator (NestJS DTOs)             |
| Logging         | Winston + Loki transport                                |
| Package manager | pnpm workspaces                                         |

---

## 3. Module Breakdown

### 3.1 Backend (NestJS)

`apps/server/src/`

| Folder        | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `auth/`       | Login, register, Google OAuth, JWT strategy, logout    |
| `accounts/`   | User bank account CRUD                                 |
| `categories/` | Per-user categories (seeded with defaults on register) |
| `import/`     | CSV upload → staging → confirm → write transactions    |
| `charts/`     | Aggregation queries for all dashboard charts           |
| `currencies/` | Static list of supported currencies (from DB enum)     |
| `users/`      | Internal user service (not exposed as public API)      |
| `prisma/`     | PrismaService + generated client                       |
| `utils/`      | Logger, date parser, Prisma error helper               |
| `config/`     | NestJS ConfigModule registration                       |
| `modules/`    | ⚠️ **EMPTY stubs** — see Critical Issues               |

**Key services:**

- `AuthService` — register, login, `validateOAuthLogin`, `getUserProfile`
- `ImportService` — `importCsv`, `getImportRows`, `confirmImport`, `importCsvDirect` (dev-only migration util)
- `ChartsService` — `getIncomeExpenseByYear`, `getMonthlyCategoryChart`, `getCategoryBreakdown`, `getIncomeExpenseStacked`, `getIncomeExpenseRatio`
- `UsersService` — create (with default categories), findByEmail, findById, findByProviderId, createOAuthUser

### 3.2 Frontend (Next.js)

`apps/ui/src/`

| Folder                    | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `app/[lang]/`             | Internationalised route group (en / ru / ua)                    |
| `app/[lang]/page.tsx`     | Landing page (hero, features, how it works, testimonials)       |
| `app/[lang]/signin/`      | Sign-in form                                                    |
| `app/[lang]/register/`    | Registration form                                               |
| `app/[lang]/upload-csv/`  | Step 1 of import — file picker                                  |
| `app/[lang]/import/`      | Step 2 of import — review & categorise rows                     |
| `app/[lang]/pennys-view/` | Main dashboard with filters + charts                            |
| `app/[lang]/profile/`     | User profile page                                               |
| `components/`             | Shared UI components (Header, Footer, Navbar, charts, etc.)     |
| `providers/`              | `AuthProvider` (user context), `ThemeProvider`                  |
| `requests/`               | API call functions (client-side and server-side fetch wrappers) |
| `utils/`                  | `clientApiFetch`, `serverApiFetch`, dictionary helpers          |
| `dictionaries/`           | i18n JSON files (en, ru, ua)                                    |
| `proxy.ts`                | Next.js middleware — locale redirect + auth guard               |

**Auth in the UI:**

- `fetchUserInfoServer` is called in the root layout server component to hydrate the `AuthProvider` with the current user before first paint.
- `AuthProvider` also does a client-side re-fetch on mount to keep state fresh.
- Protected routes: `/profile`, `/upload-csv`, `/pennys-view`, `/import`

### 3.3 Shared Packages

**`packages/schemas`** — Zod schemas shared between frontend and backend:

- Auth: `LoginInput`, `RegisterInput`, `UserInfo`
- Transactions: `CsvRowSchema`, `ConfirmImportInput`
- Charts: query/response schemas for all 5 chart types
- Accounts, Categories, Currencies

**`packages/schemas-nest`** — NestJS DTOs that wrap the Zod schemas for Swagger and `class-validator` compatibility. Uses `nestjs-zod` under the hood.

---

## 4. Data Model

```
User
  ├── accounts[]        → Account (name, unique per user)
  ├── categories[]      → Category (name, icon, color, isDefault)
  └── transactions[]    → Transaction (amount, currency, type, date, accountId, categoryId?)

TransactionImport       ← staging table for CSV import
  └── rows[]            → TransactionImportRow (date, description, amount, categoryId?)
```

**Enums in DB:**

- `TransactionType`: `INCOME | EXPENSE`
- `Currency`: `USD | EUR | UAH | GBP | PLN`
- `ImportStatus`: `PENDING | CONFIRMED`

**Indexes:**

- `Transaction(userId, date)`
- `Transaction(accountId, date)`
- `Transaction(categoryId, date)`

---

## 5. Auth Flow

```
Email/password:
  POST /auth/register  →  hash password  →  create user + default categories
                       →  sign JWT  →  set HTTP-only cookie  →  { success: true }

  POST /auth/login     →  find user  →  bcrypt.compare  →  sign JWT  →  set cookie

Google OAuth:
  GET /auth/google     →  redirect to Google consent screen
  GET /auth/google/callback
                       →  passport validates  →  find or create user
                       →  sign JWT  →  set cookie  →  redirect to UI

JWT:
  Algorithm: HS256 (default)
  Expiry: 1 hour
  Storage: HTTP-only cookie `access_token` (maxAge: 24h — mismatch, see Critical Issues)

Middleware guard (proxy.ts):
  Checks cookie EXISTS — does NOT validate the JWT signature/expiry
```

---

## 6. CSV Import Flow

```
1. User picks file on /upload-csv
   → POST /import/csv (multipart)
   → server validates columns (date, description, amount)
   → server saves rows to TransactionImportRow (PENDING)
   → returns { importId }

2. User is redirected to /import/:importId
   → GET /import/:importId/rows
   → user assigns categories, edits descriptions

3. User clicks "Confirm"
   → POST /import/:importId/confirm
   → body: { accountId, currency, rows: [{ id, categoryId?, description? }] }
   → server reads staging rows, creates real Transaction records
   → marks import as CONFIRMED
```

**PENDING imports are never cleaned up** — no TTL or scheduled job.

---

## 7. Critical Issues 🔴

These should be fixed before any significant feature work.

---

### 7.1 Hardcoded JWT fallback secret ✅ FIXED

> Commit: `fix(auth): remove hardcoded JWT secret fallback and enforce env validation`

**File:** `apps/server/src/auth/auth.module.ts` and `apps/server/src/auth/jwt.strategy.ts`

```typescript
secret: config.get<string>('JWT_SECRET') || 'defaultSecret',
```

If `JWT_SECRET` is missing from `.env`, the app silently uses `'defaultSecret'`. Any attacker who knows this (it's public in the repo) can forge valid JWTs and impersonate any user.

**Fix:** Remove the fallback. Let it throw at startup if the env var is missing (Joi validation in `main.ts` should catch it, but `JWT_SECRET` is not in the Joi schema — add it).

---

### 7.2 JWT_SECRET missing from Joi validation schema ✅ FIXED

> Commit: `fix(auth): remove hardcoded JWT secret fallback and enforce env validation`

**File:** `apps/server/src/main.ts`

`JWT_SECRET` is used by the app but not listed in the `Joi.object({...})` validation schema. If it's absent the app starts without warning and falls back to `'defaultSecret'`.

**Fix:** Add `JWT_SECRET: Joi.string().required()` to the validation schema.

---

### 7.3 OAuth user + existing email account crash (unhandled 500) ✅ FIXED

> Commit: `fix(auth): handle duplicate email conflict in OAuth login flow`

**File:** `apps/server/src/auth/auth.service.ts` → `validateOAuthLogin`

If a user registered with email/password, then tries Google OAuth with the same email address, `findByProviderId` returns null (different lookup key), so `createOAuthUser` is called — which triggers a Prisma `P2002` unique constraint error on `userEmail`. This is **not caught**, resulting in a 500 response with internal Prisma error details potentially leaking to the client.

**Fix:** In `validateOAuthLogin`, if `findByProviderId` returns null, also try `findByEmail`. If a local account exists, either link the providers or return a clear error message.

---

### 7.4 `passwordHash` null crash on OAuth user email-login ✅ FIXED

> Commit: `fix(auth): guard against null passwordHash for OAuth-only accounts on login`

**File:** `apps/server/src/auth/auth.service.ts` → `login`

```typescript
const valid = await bcrypt.compare(password, user.passwordHash);
```

If an OAuth-only user (no `passwordHash`) tries to log in via the email/password form, `user.passwordHash` is `null`. `bcrypt.compare` with a null hash will throw, resulting in an unhandled 500 instead of a clean "login not available" error.

**Fix:** Add a null check before the `bcrypt.compare` call:

```typescript
if (!user.passwordHash) {
  throw new UnauthorizedException({ code: 'auth.oauth_only_account' });
}
```

---

### 7.5 No file size limit on CSV upload ✅ FIXED

> Commit: `fix(import): add 5 MB file size limit to CSV upload`

**File:** `apps/server/src/import/import.controller.ts`

```typescript
@UseInterceptors(FileInterceptor('file'))
```

No `limits` option is passed, so Multer will accept files of any size. A malicious user could send a multi-GB file, causing out-of-memory issues.

**Fix:**

```typescript
@UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })) // 5 MB
```

---

### 7.6 JWT 1-hour expiry vs. 24-hour cookie ✅ FIXED

> Commit: `fix(auth): align cookie maxAge with JWT expiry via shared constant`
> JWT bumped to `'24h'` in commit `fix(auth): remove hardcoded JWT secret fallback and enforce env validation`

**File:** `apps/server/src/auth/auth.module.ts` and `apps/server/src/auth/auth.controller.ts`

JWT `expiresIn: '1h'` but the cookie `maxAge` is 24 hours. After 1 hour the cookie still exists, the user appears logged in on the UI, but every API call fails with 401 until the next full page load (which calls `/auth/profile` and clears the user state). This is a confusing user experience.

**Fix:** Either match the cookie maxAge to the JWT expiry, or implement a refresh-token mechanism.

---

### 7.7 Empty `src/modules/` folder — dead code in production DI ✅ FIXED

> Commit: `fix(server): remove empty stub modules and duplicate UsersService from DI`

**File:** `apps/server/src/app.module.ts`

```typescript
import { AccountModule } from './modules/account/account.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
```

All four of these are scaffold stubs with empty controllers and empty services. They are imported and registered in `AppModule` alongside the real modules (`AccountsModule`, `CategoriesModule`, etc.). This is dead code and creates confusion about which module is the real one.

**Fix:** Delete `src/modules/` entirely and remove the four imports from `AppModule`.

---

### 7.8 `UsersService` registered twice in the DI container ✅ FIXED

> Commit: `fix(server): remove empty stub modules and duplicate UsersService from DI`

**File:** `apps/server/src/app.module.ts`

```typescript
imports: [..., UsersModule, ...],   // UsersModule exports UsersService
providers: [..., UsersService, ...], // also directly provided here
```

`UsersService` ends up with two provider registrations, creating two separate instances. Any code that injects it from `AppModule` gets a different instance than code that injects it via `UsersModule`. Stateful services would be broken; for a stateless service it's just wasteful.

**Fix:** Remove `UsersService` from `AppModule.providers`. It is already available via `UsersModule`.

---

### 7.9 `ConfigModule.forRoot()` called outside the app context ✅ FIXED

> Commit: `fix(auth): remove hardcoded JWT secret fallback and enforce env validation`

**File:** `apps/server/src/main.ts`

```typescript
ConfigModule.forRoot({ load: [configuration], validationSchema: Joi.object({...}) });
// ... then:
const app = await NestFactory.create(AppModule);
```

`ConfigModule.forRoot()` called outside `NestFactory.create()` does nothing — it returns a module descriptor but never registers it with any container. The Joi validation schema defined here never runs. The actual config is loaded by `ConfigModule.forRoot({ isGlobal: true })` inside `AppModule`, which has no validation schema.

**Fix:** Move the Joi `validationSchema` into the `ConfigModule.forRoot()` call inside `AppModule`. Remove the orphaned call in `main.ts`.

---

### 7.10 `importCsvDirect` — development migration utility exposed in production ✅ ACKNOWLEDGED

> Commit: `chore(import): mark importCsvDirect as legacy data migration tool`
> Intentionally kept — marked with a LEGACY comment. Not wired to any public API endpoint.

**File:** `apps/server/src/import/import.service.ts`

The `importCsvDirect` method reads a hardcoded local file `cleaned_transactions.csv` and bulk-inserts transactions directly into the DB, overriding the normal import flow. It has minimal validation. This looks like a one-off data migration tool that was never removed.

**Fix:** Delete the method (and its controller endpoint if one exists) before deploying to production.

---

### 7.11 `serverApiFetch` uses `NEXT_PUBLIC_SERVER_URL` (public env var) ✅ FIXED

> Commit: `fix(ui): use private SERVER_URL and add Content-Type header in serverApiFetch`

**File:** `apps/ui/src/utils/serverApiFetch.ts`

```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${path}`, ...)
```

`NEXT_PUBLIC_` variables are embedded in the client bundle. This leaks your internal server address to every browser that loads the app. Server-side fetches should use the private `SERVER_URL` env var.

**Fix:** Use `process.env.SERVER_URL` (no `NEXT_PUBLIC_`) in `serverApiFetch.ts`.

---

### 7.12 `serverApiFetch` missing `Content-Type: application/json` header ✅ FIXED

> Commit: `fix(ui): use private SERVER_URL and add Content-Type header in serverApiFetch`

**File:** `apps/ui/src/utils/serverApiFetch.ts`

When a body is included, there is no `Content-Type: application/json` header set. POST/PUT requests with a JSON body will likely fail to be parsed by NestJS.

**Fix:** Add `'Content-Type': 'application/json'` when a body is present, mirroring `clientApiFetch.ts`.

---

## 8. Good-to-Have Improvements 🟡

These are not breaking but would meaningfully improve the codebase.

---

### 8.1 No rate limiting on auth endpoints

`POST /auth/login` and `POST /auth/register` have no rate limiting. An attacker can brute-force passwords or spam account creation.

**Suggestion:** Add `@nestjs/throttler` with a global guard, plus stricter limits on `/auth/login`.

---

### 8.2 No refresh token — session ends silently after 1 hour

Once the JWT expires, users get 401s with no way to recover without manually re-logging in. There's no refresh token endpoint.

**Suggestion:** Implement a refresh token (stored in a second HTTP-only cookie with a longer TTL) or use a sliding-session approach.

---

### 8.3 Tests are skeleton-only

Every test file contains just:

```typescript
it('should be defined', () => {
  expect(controller).toBeDefined();
});
```

There are no real unit or integration tests. Critical flows (auth, import, charts) are completely untested.

**Suggestion:** Start with integration tests for `AuthService.login` (invalid password, OAuth-only user), `ImportService.confirmImport` (happy path, missing rows, already-confirmed), and at least one chart query.

---

### 8.4 No pagination on transactions

`ChartsService.getMonthlyCategoryChart` does a `findMany` over all transactions for an entire year. For a power user with thousands of transactions this becomes a large query without any pagination or cursor.

**Suggestion:** The chart aggregation queries should use `groupBy` (already done for some) or at minimum document the expected scale limits. For a list/table view of transactions, add cursor-based pagination.

---

### 8.5 No manual transaction CRUD

There is no endpoint to create, edit, or delete individual transactions except via the CSV import flow. Users can't fix a typo in a description or delete a duplicate without re-importing.

**Suggestion:** Add `PATCH /transactions/:id` and `DELETE /transactions/:id` at minimum.

---

### 8.6 PENDING imports never cleaned up

`TransactionImport` records with `status: PENDING` accumulate indefinitely. There is no TTL, no cleanup job, and no delete endpoint for abandoned imports.

**Suggestion:** Add a scheduled task (`@nestjs/schedule`) to delete PENDING imports older than e.g. 7 days.

---

### 8.7 `Internal Transfer` exclusion is by name (fragile)

```typescript
const EXCLUDED_CATEGORY_NAME = 'Internal Transfer';
```

Chart queries exclude this category by its hardcoded name. If a user renames the category (no rename endpoint exists yet, but still), the exclusion silently stops working.

**Suggestion:** Add an `isExcludedFromCharts` boolean to the `Category` model, or use `isDefault` as a proxy and store the exclusion flag on the default seed.

---

### 8.8 Both `csv-parse` and `csv-parser` are installed

`package.json` lists both `csv-parse` and `csv-parser`. Only `csv-parse` (the sync API) is actually used.

**Suggestion:** Remove `csv-parser` from dependencies.

---

### 8.9 `fs` dummy package in dependencies

```json
"fs": "^0.0.1-security"
```

This is a security placeholder package, not the Node.js built-in `fs`. The built-in is already available in Node — adding this npm package achieves nothing and adds a pointless dependency.

**Suggestion:** Remove `"fs"` from `package.json`.

---

### 8.10 `async_hooks` as a real dependency

```json
"async_hooks": "^1.0.0"
```

`async_hooks` is a Node.js built-in module. Similar to `fs`, pulling it from npm is unnecessary.

**Suggestion:** Remove it from `package.json`.

---

### 8.11 Weak MIME check for CSV uploads

```typescript
if (!file.mimetype.includes('csv')) { ... }
```

`mimetype` is supplied by the client, not determined by the server. A motivated user can spoof it. The server will still reject non-CSV content at the parse stage, but the error message would be misleading.

**Suggestion:** The parse-stage rejection is sufficient; consider adding a file extension check as a secondary hint, but don't rely on MIME type for security.

---

### 8.12 Hardcoded chart month labels (not i18n)

```typescript
const labels = ['Jan', 'Feb', 'Mar', ...]
```

These are hardcoded English strings returned from the API. If the UI is shown in Russian or Ukrainian, the month labels from the chart API remain in English.

**Suggestion:** Return numeric month numbers from the API and let the frontend format them using the active locale.

---

### 8.13 No global exception filter

Unhandled Prisma errors (beyond `P2002`) will produce 500 responses that may include Prisma's `pretty` error format, which can leak schema/query information in production (`errorFormat: 'pretty'` in `PrismaService`).

**Suggestion:** Add a NestJS `ExceptionFilter` that catches `PrismaClientKnownRequestError` and maps common codes (P2002, P2025, etc.) to appropriate HTTP responses. Switch `errorFormat` to `'minimal'` in production.

---

### 8.14 No account/category delete endpoints

Users can create accounts and categories but cannot delete them. This will become a pain point as users accumulate test data.

**Suggestion:** Add `DELETE /accounts/:id` and `DELETE /categories/:id`, with a check that the category is not the last one or that it's replaceable.

---

### 8.15 Page metadata placeholder

```typescript
description: 'Generated by create next app', //TODO: to update
```

The global layout metadata was never updated from the Next.js scaffold default.

---

### 8.16 Middleware cookie check — expired tokens pass the guard

`proxy.ts` only checks that the `access_token` cookie exists. An expired but syntactically valid token will pass the middleware and only fail when the actual API call is made. This means the UI can briefly flash the protected page before redirecting.

**Suggestion:** Decode (not verify — Edge runtime has constraints) the JWT in middleware to check the `exp` claim. A lighter approach: just let the API call return 401 and handle it in the UI with a redirect.

---

## 9. What's Done Well ✅

- **Monorepo with shared schemas** — the `schemas` package means validation logic is defined once and shared between frontend and backend, preventing drift.
- **HTTP-only cookies for JWT** — avoids XSS-based token theft compared to `localStorage`.
- **Trace IDs on every request** — the `TraceMiddleware` adds a UUID trace ID to every request context, which is piped into Winston logs. Good for debugging in production.
- **Proper Prisma transactions** — user creation (with default categories) and CSV confirmation both use `$transaction` correctly.
- **`Promise.allSettled` for parallel data fetches** — the dashboard page uses `allSettled` so a single failing fetch doesn't break the whole page.
- **Zod runtime validation on API responses (frontend)** — `ImportCsvResponseSchema.parse(data)` in `importCsv.ts` validates the response at runtime, catching server schema changes early.
- **Swagger documentation** — all endpoints are decorated with `@ApiOperation`, `@ApiResponse` etc.
- **i18n support** — three languages (en/ru/ua) with dictionary-based translations throughout the UI.
- **Google OAuth** — fully functional OAuth flow with automatic account creation.
- **`make check-env`** — the Makefile validates that all required env vars are present before starting the server.
- **DB indexes on Transaction** — `(userId, date)`, `(accountId, date)`, `(categoryId, date)` cover the most common query patterns.
- **Structured error codes** — errors use `{ code: 'module.specific_error' }` format consistently, making it easy for the frontend to map them to user-facing messages.
