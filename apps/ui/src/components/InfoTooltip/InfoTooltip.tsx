'use client';

import { Tooltip, IconButton, Box, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ReactNode } from 'react';

interface InfoTooltipProps {
  content: ReactNode;
  size?: 'small' | 'medium';
}

export default function InfoTooltip({
  content,
  size = 'small',
}: InfoTooltipProps) {
  return (
    <Tooltip
      arrow
      placement="top"
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 260,
            fontSize: 12,
          },
        },
      }}
      title={<Box>{content}</Box>}
    >
      <IconButton
        size={size}
        sx={{
          p: 0.5,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <HelpOutlineIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}
