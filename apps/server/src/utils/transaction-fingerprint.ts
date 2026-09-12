import { createHash } from 'crypto';

// Identifies a "same transaction" for dedupe purposes: date + absolute amount + normalised description.
export function buildTransactionFingerprint(
  date: Date,
  amount: number,
  description: string,
): string {
  const normalisedDate = date.toISOString().slice(0, 10);
  const normalisedAmount = Math.abs(amount).toFixed(2);
  const normalisedDescription = description.trim().toLowerCase();

  return createHash('sha256')
    .update(`${normalisedDate}|${normalisedAmount}|${normalisedDescription}`)
    .digest('hex');
}
