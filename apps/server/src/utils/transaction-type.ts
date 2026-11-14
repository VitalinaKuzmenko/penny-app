import { TRANSFER_CATEGORY_NAME } from '../categories/default-categories';
import { TransactionType } from '../prisma/generated/prisma/client';

// signedAmount is the bank's sign: negative = money out, positive = money in
export const resolveTransactionType = (
  signedAmount: number,
  category: { name: string } | null,
): TransactionType => {
  if (signedAmount <= 0) return TransactionType.EXPENSE;
  if (!category || category.name === TRANSFER_CATEGORY_NAME) {
    return TransactionType.INCOME;
  }
  return TransactionType.REFUND;
};
