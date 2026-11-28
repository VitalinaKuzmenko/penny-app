'use client';

import { Stack, Typography } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

interface HomeCheckListProps {
  items: string[];
  // text and icon colour, so it works on both the cream page and the plum panel
  tone?: 'light' | 'dark';
}

// Row of small "✓ reassurance" items under the hero and final call to action
export default function HomeCheckList({
  items,
  tone = 'light',
}: HomeCheckListProps) {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      columnGap={2.5}
      rowGap={0.75}
      justifyContent={{ xs: 'center', lg: 'inherit' }}
    >
      {items.map((item) => (
        <Stack key={item} direction="row" spacing={0.75} alignItems="center">
          <CheckCircleOutline
            fontSize="small"
            sx={{ color: tone === 'dark' ? '#8FE3B5' : 'success.main' }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: tone === 'dark' ? 'sidebar.text' : 'text.secondary',
            }}
          >
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
