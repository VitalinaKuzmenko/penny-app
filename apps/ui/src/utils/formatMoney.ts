// Exact amounts (pennies) for ledger-style views; charts round via formatCurrency
export const formatMoney = (
  value: number,
  currency: string = 'GBP',
  signDisplay: 'auto' | 'always' | 'never' = 'auto',
) =>
  value.toLocaleString('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay,
  });
