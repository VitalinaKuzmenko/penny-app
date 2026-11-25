import { TransactionType } from '../prisma/generated/prisma/client';

// signedAmount is the bank's sign: negative = money out, positive = money in
export const resolveTransactionType = (
  signedAmount: number,
  category: { isTransfer: boolean } | null,
): TransactionType => {
  if (signedAmount <= 0) return TransactionType.EXPENSE;
  if (!category || category.isTransfer) {
    return TransactionType.INCOME;
  }
  return TransactionType.REFUND;
};
