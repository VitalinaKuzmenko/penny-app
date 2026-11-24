/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { TransactionTotals } from 'schemas';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';
import { formatMoney } from '@/utils/formatMoney';

interface TotalsBarProps {
  totals: TransactionTotals | null;
  pageText: Record<string, any>;
}

export default function TotalsBar({ totals, pageText }: TotalsBarProps) {
  const text = pageText.TOTALS;

  const items = [
    { label: text.COUNT, value: totals ? String(totals.count) : '—' },
    {
      label: text.SPENT,
      value: totals ? formatMoney(totals.spent) : '—',
    },
    {
      label: text.INCOME,
      value: totals ? formatMoney(totals.income) : '—',
    },
    {
      label: text.NET,
      value: totals ? formatMoney(totals.net) : '—',
      color: totals
        ? totals.net < 0
          ? 'error.main'
          : 'success.main'
        : undefined,
    },
  ];

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 4 }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        {items.map((item) => (
          <Box key={item.label}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h6" fontWeight={600} color={item.color}>
              {item.value}
            </Typography>
          </Box>
        ))}
        <InfoTooltip content={text.INFO} />
      </Stack>
    </Paper>
  );
}
