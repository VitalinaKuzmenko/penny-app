'use client';

import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface BulkActionsPanelProps {
  selectedCount: number;
  // e.g. "selected", shown after the count
  label: string;
  // buttons for the whole selection, shown next to the count (e.g. delete)
  actions?: ReactNode;
  // one control per action (category, tags…); side by side on wide screens
  children: ReactNode;
}

export default function BulkActionsPanel({
  selectedCount,
  label,
  actions,
  children,
}: BulkActionsPanelProps) {
  if (!selectedCount) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
          {selectedCount} {label}
        </Typography>
        {actions}
      </Stack>
      <Box
        display="grid"
        gap={2}
        // minmax(0, …) lets the columns shrink below their buttons' text width
        gridTemplateColumns={{
          xs: 'minmax(0, 1fr)',
          lg: 'repeat(2, minmax(0, 1fr))',
        }}
        alignItems="start"
      >
        {children}
      </Box>
    </Paper>
  );
}

// Shared row layout for a field plus its buttons: one line from sm up,
// field above full-width buttons on phones
export const bulkRowSx = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'stretch', sm: 'flex-start' },
  gap: 1,
} as const;

// Every row's buttons take the same width so the fields line up when stacked
export const bulkButtonsSx = {
  display: 'flex',
  gap: 1,
  flexShrink: 0,
  width: { xs: '100%', sm: 300 },
} as const;

export const bulkButtonSx = {
  minHeight: 40,
  flex: 1,
  minWidth: 0,
  whiteSpace: { xs: 'normal', sm: 'nowrap' },
  lineHeight: 1.2,
} as const;
