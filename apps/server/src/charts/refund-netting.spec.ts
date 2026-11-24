import { incomeAndNetExpense, netSpend, totalsByType } from './refund-netting';

describe('refund netting', () => {
  it.each([
    [100, 55, 45],
    [100, 0, 100],
    [10, 30, 0],
    [10.1, 10.1, 0],
    [0.3, 0.1, 0.2],
  ])('netSpend(%p, %p) = %p', (expense, refund, expected) => {
    expect(netSpend(expense, refund)).toBe(expected);
  });

  it('sums grouped rows by type and treats refunds as negative expense', () => {
    const totals = totalsByType([
      { type: 'INCOME', _sum: { amount: 1000 } },
      { type: 'EXPENSE', _sum: { amount: '100.00' } },
      { type: 'REFUND', _sum: { amount: 55 } },
      { type: 'EXPENSE', _sum: { amount: null } },
    ]);

    expect(totals).toEqual({ INCOME: 1000, EXPENSE: 100, REFUND: 55 });
    expect(incomeAndNetExpense(totals)).toEqual({ income: 1000, expense: 45 });
  });
});
