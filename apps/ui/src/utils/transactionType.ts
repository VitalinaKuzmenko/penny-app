import { Category } from 'schemas';

// Mirrors the server rule for money in: no category or a transfer is income,
// any other category makes it a refund. Money out is always an expense.
export const resolveMoneyInType = (
  categoryId: string | null,
  categories: Category[],
): 'INCOME' | 'REFUND' => {
  if (!categoryId) return 'INCOME';
  const category = categories.find((c) => c.id === categoryId);
  return !category || category.isTransfer ? 'INCOME' : 'REFUND';
};
