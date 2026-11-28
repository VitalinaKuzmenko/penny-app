/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { TransactionTotals } from 'schemas';
import { formatMoney } from '@/utils/formatMoney';
import StatCards from '@/components/StatCards/StatCards';
import { STAT_CARD_STYLES } from '@/components/StatCards/statCardStyles';

interface TotalsBarProps {
  totals: TransactionTotals | null;
  pageText: Record<string, any>;
}

export default function TotalsBar({ totals, pageText }: TotalsBarProps) {
  const text = pageText.TOTALS;

  return (
    <StatCards
      columns={{
        xs: 'minmax(0, 1fr)',
        sm: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(4, minmax(0, 1fr))',
      }}
      items={[
        {
          label: text.COUNT,
          value: totals ? String(totals.count) : '—',
          // explains what the totals include, for all four cards
          tooltip: text.INFO,
          ...STAT_CARD_STYLES.transactions,
        },
        {
          label: text.SPENT,
          value: totals ? formatMoney(totals.spent) : '—',
          ...STAT_CARD_STYLES.expense,
        },
        {
          label: text.INCOME,
          value: totals ? formatMoney(totals.income) : '—',
          ...STAT_CARD_STYLES.income,
        },
        {
          label: text.NET,
          value: totals ? formatMoney(totals.net) : '—',
          valueColor: totals
            ? totals.net < 0
              ? 'error.main'
              : 'success.dark'
            : undefined,
          ...STAT_CARD_STYLES.savings,
        },
      ]}
    />
  );
}
