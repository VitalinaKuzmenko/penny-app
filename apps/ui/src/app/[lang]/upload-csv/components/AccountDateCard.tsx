'use client';

import { Box, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

interface AccountDateCardProps {
  name: string;
  date: string | null;
  emptyText: string;
  index?: number;
}

const tones = ['#FDEBEE', '#E9F8EF', '#EAF0FC', '#F3E8FA'];

// Client component so sx can read the theme; dates are pre-formatted on the server
export default function AccountDateCard({
  name,
  date,
  emptyText,
  index = 0,
}: AccountDateCardProps) {
  const [truncated, setTruncated] = useState(false);

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: '16px',
        bgcolor: tones[index % tones.length],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        minWidth: 0,
      }}
    >
      <Tooltip title={truncated ? name : ''}>
        <Typography
          variant="body2"
          fontWeight={500}
          color="text.primary"
          noWrap
          onMouseEnter={(e) =>
            setTruncated(
              e.currentTarget.scrollWidth > e.currentTarget.clientWidth,
            )
          }
        >
          {name}
        </Typography>
      </Tooltip>

      <Box
        sx={{
          flexShrink: 0,
          px: 1.75,
          py: 0.5,
          borderRadius: 999,
          bgcolor: 'rgba(243, 228, 252, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 2px 6px rgba(83, 36, 70, 0.08)',
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color={date ? 'text.primary' : 'text.secondary'}
          noWrap
        >
          {date ?? emptyText}
        </Typography>
      </Box>
    </Box>
  );
}
