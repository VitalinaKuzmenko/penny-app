/**
 * One-off backfill: compute `Transaction.fingerprint` for rows that predate the
 * duplicate-detection feature (fingerprint IS NULL), so historical transactions
 * take part in dedupe on future imports.
 *
 * Uses the exact same buildTransactionFingerprint() as the import flow, so the
 * values are guaranteed to match what new imports produce.
 *
 * Usage (from apps/server):
 *   pnpm backfill:fingerprints                     # dry run — reports what would change
 *   pnpm backfill:fingerprints --apply             # writes fingerprints (local DB only)
 *   pnpm backfill:fingerprints --apply --remote    # required to write to a non-local host
 *
 * DATABASE_URL is read from .env / the environment. For production:
 *   DATABASE_URL="postgresql://…prod…" pnpm backfill:fingerprints --apply --remote
 *
 * Idempotent: only touches rows where fingerprint IS NULL, so it is safe to
 * re-run; a second run is a no-op.
 *
 * .env is loaded by the `-r dotenv/config` preload in the package.json script.
 */
/* eslint-disable no-console */
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'pg-connection-string';

import { Prisma, PrismaClient } from '../src/prisma/generated/prisma/client';
import { buildTransactionFingerprint } from '../src/utils/transaction-fingerprint';

const BATCH_SIZE = 500;
const apply = process.argv.includes('--apply');
const allowRemote = process.argv.includes('--remote');
const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  'db',
  'penny-db',
]);

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  const cfg = parse(url);
  const adapter = new PrismaPg({
    host: cfg.host,
    port: Number(cfg.port),
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
  });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = createClient();
  const host = parse(process.env.DATABASE_URL!).host ?? '';

  // .env is easy to leave pointing at prod; make writing there a deliberate act
  if (apply && !LOCAL_HOSTS.has(host) && !allowRemote) {
    console.error(
      `Refusing to --apply against non-local host "${host}". ` +
        'Add --remote if you really mean to write to this database.',
    );
    process.exit(2);
  }

  console.log(
    `${apply ? 'APPLYING' : 'DRY RUN'} fingerprint backfill against ${host}`,
  );

  const total = await prisma.transaction.count({
    where: { fingerprint: null },
  });
  console.log(`Transactions without a fingerprint: ${total}`);

  if (total === 0) {
    console.log('Nothing to do.');
    return prisma.$disconnect();
  }

  let processed = 0;
  let updated = 0;
  let cursor: string | undefined;

  for (;;) {
    const batch = await prisma.transaction.findMany({
      where: { fingerprint: null },
      select: { id: true, date: true, amount: true, description: true },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      // cursor pagination so rows we've already updated don't shift the window
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (batch.length === 0) break;

    const updates = batch.map((t) => ({
      id: t.id,
      fingerprint: buildTransactionFingerprint(
        t.date,
        Number(t.amount),
        t.description ?? '',
      ),
    }));

    if (apply) {
      // One statement per batch. Individual update() calls inside an interactive
      // transaction exceed Prisma's 5s timeout over a remote pooler.
      const values = Prisma.join(
        updates.map((u) => Prisma.sql`(${u.id}, ${u.fingerprint})`),
      );
      const count = await prisma.$executeRaw`
        UPDATE "Transaction" AS t
        SET fingerprint = v.fingerprint
        FROM (VALUES ${values}) AS v(id, fingerprint)
        WHERE t.id = v.id AND t.fingerprint IS NULL
      `;
      updated += count;
    } else if (processed === 0) {
      console.log('Sample of what would be written:');
      for (const u of updates.slice(0, 3)) {
        const t = batch.find((b) => b.id === u.id)!;
        console.log(
          `  ${t.date.toISOString().slice(0, 10)}  ${String(t.amount).padStart(10)}  ${(
            t.description ?? ''
          )
            .slice(0, 30)
            .padEnd(30)}  → ${u.fingerprint.slice(0, 12)}…`,
        );
      }
    }

    processed += batch.length;
    cursor = batch[batch.length - 1].id;
    process.stdout.write(`\r${processed}/${total}`);
  }
  process.stdout.write('\n');

  if (apply) {
    const remaining = await prisma.transaction.count({
      where: { fingerprint: null },
    });
    console.log(
      `Updated ${updated} rows. Remaining without fingerprint: ${remaining}`,
    );
  } else {
    console.log(
      `Would update ${processed} rows. Re-run with --apply to write.`,
    );
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
