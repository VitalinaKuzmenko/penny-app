/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { GetIncomeExpenseResponse } from 'schemas';
import { formatCurrencyLabel } from '@/utils/formatCurrency';
import StatCards from '@/components/StatCards/StatCards';
import { STAT_CARD_STYLES } from '@/components/StatCards/statCardStyles';

interface SummaryCardsProps {
  // same totals the Income vs Expense chart shows; null while loading or on error
  data: GetIncomeExpenseResponse | null;
  pennysViewPageText: Record<string, any>;
}

const format = (value: number | undefined) =>
  value === undefined ? '—' : formatCurrencyLabel(value);

export default function SummaryCards({
  data,
  pennysViewPageText,
}: SummaryCardsProps) {
  const names = pennysViewPageText.CHARTS.INCOME_EXPENSE.CHART_NAMES;

  return (
    <StatCards
      // three across once each card is wide enough for the single-row layout
      columns={{ xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' }}
      items={[
        {
          label: names.INCOME,
          value: format(data?.income),
          ...STAT_CARD_STYLES.income,
        },
        {
          label: names.EXPENSE,
          // the chart shows expenses as a positive bar, so the card does too
          value: format(data ? Math.abs(data.expense) : undefined),
          ...STAT_CARD_STYLES.expense,
        },
        {
          label: names.SAVINGS,
          value: format(data?.savings),
          ...STAT_CARD_STYLES.savings,
        },
      ]}
    />
  );
}
