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
      <Stack direction="row" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box
          sx={{
            flex: { xs: 1, sm: 'none' },
            display: { xs: 'grid', sm: 'flex' },
            // phones: 2 columns, the smallest phones (< 360px): 1 column
            gridTemplateColumns: '1fr 1fr',
            '@media (max-width: 359.95px)': { gridTemplateColumns: '1fr' },
            gap: { xs: 1.5, sm: 4 },
          }}
        >
          {items.map((item) => (
            <Box key={item.label} sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight={600} color={item.color}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ ml: { xs: 1, sm: 4 } }}>
          <InfoTooltip content={text.INFO} />
        </Box>
      </Stack>
    </Paper>
  );
}
