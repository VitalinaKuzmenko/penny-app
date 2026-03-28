export const formatCurrency = (
  value:
    | number
    | string
    | readonly (number | string)[]
    | boolean
    | null
    | undefined,
  currency: string = 'GBP',
) => {
  if (value == null || typeof value === 'boolean') return '';

  if (Array.isArray(value)) {
    return value
      .map((v) =>
        typeof v === 'number'
          ? v.toLocaleString('en-GB', {
              style: 'currency',
              currency,
              maximumFractionDigits: 0,
            })
          : v,
      )
      .join(', ');
  }

  if (typeof value === 'number') {
    return value.toLocaleString('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
  }

  return value;
};

export const formatCurrencyLabel = (value: unknown): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = formatCurrency(value as any);

  // Ensure it's always a string
  if (Array.isArray(result)) {
    return result.join(', ');
  }

  return String(result ?? '');
};
