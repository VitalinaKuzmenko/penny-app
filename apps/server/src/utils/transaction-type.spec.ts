import { resolveTransactionType } from './transaction-type';

describe('resolveTransactionType', () => {
  const clothes = { name: 'Clothes, cosmetics' };
  const transfer = { name: 'Internal Transfer' };

  it.each([
    [-100, clothes, 'EXPENSE'],
    [-100, null, 'EXPENSE'],
    [-100, transfer, 'EXPENSE'],
    [0, null, 'EXPENSE'],
    [55, null, 'INCOME'],
    [55, transfer, 'INCOME'],
    [55, clothes, 'REFUND'],
  ])('amount %p with category %p → %s', (amount, category, expected) => {
    expect(resolveTransactionType(amount, category)).toBe(expected);
  });
});
