'use client';

import { Box, Typography } from '@mui/material';

interface AccountDateCardProps {
  name: string;
  date: string | null;
  relative: string | null;
  emptyText: string;
}

// Client component so sx can read the theme; dates are pre-formatted on the server
export default function AccountDateCard({
  name,
  date,
  relative,
  emptyText,
}: AccountDateCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        color: 'primary.contrastText',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        boxShadow: '0 6px 14px rgba(4, 22, 70, 0.25)',
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.75 }} noWrap>
        {name}
      </Typography>

      {date ? (
        <>
          <Typography variant="h6" fontWeight={700}>
            {date}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {relative}
          </Typography>
        </>
      ) : (
        <Typography variant="body1" sx={{ opacity: 0.75 }} mt={0.5}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );
}
