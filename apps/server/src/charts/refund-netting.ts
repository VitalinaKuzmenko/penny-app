import { TransactionType } from '../prisma/generated/prisma/client';

export type TypeTotals = Record<TransactionType, number>;

export const emptyTypeTotals = (): TypeTotals => ({
  INCOME: 0,
  EXPENSE: 0,
  REFUND: 0,
});

// Refunds reduce spend but never below 0. Rounded to pennies so float
// leftovers (e.g. 10.1 - 10.1) don't show up as a tiny non-zero amount.
export const netSpend = (expense: number, refund: number): number =>
  Math.max(0, Math.round((expense - refund) * 100) / 100);

export const totalsByType = (
  rows: { type: TransactionType; _sum: { amount: unknown } }[],
): TypeTotals =>
  rows.reduce((totals, r) => {
    totals[r.type] += Number(r._sum.amount ?? 0);
    return totals;
  }, emptyTypeTotals());

// Refunds are not income; they come off expense instead
export const incomeAndNetExpense = (totals: TypeTotals) => ({
  income: totals.INCOME,
  expense: netSpend(totals.EXPENSE, totals.REFUND),
});
