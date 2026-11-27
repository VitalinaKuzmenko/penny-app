'use client';

import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface ImportInfoItemProps {
  icon: ReactNode;
  label: string;
  // id for the label so a form control can reference it via aria-labelledby
  labelId?: string;
  children: ReactNode;
}

// Icon + bold label above a value or control, as in the import info card
export default function ImportInfoItem({
  icon,
  label,
  labelId,
  children,
}: ImportInfoItemProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-end" minWidth={0}>
      {/* same height as the small inputs so the icon lines up with them */}
      <Box
        sx={{
          color: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          height: 40,
          fontSize: 30,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          id={labelId}
          variant="body2"
          fontWeight={700}
          color="text.primary"
          sx={{ mb: 0.5 }}
        >
          {label}
        </Typography>
        {children}
      </Box>
    </Stack>
  );
}
