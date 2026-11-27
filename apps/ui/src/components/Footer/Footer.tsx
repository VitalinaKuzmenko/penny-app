'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import logo from '../../../public/penny_logo.svg';

export const Footer = () => {
  return (
    <Box
      sx={{
        minHeight: '160px',
        mx: { xs: 1.5, md: 2.5 },
        mb: { xs: 1.5, md: 2.5 },
        borderRadius: 5,
        backgroundColor: 'sidebar.background',
        color: 'sidebar.text',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          component="a"
          href="/"
        >
          <Image
            src={logo}
            alt="logo"
            width={64}
            height={64}
            style={{ borderRadius: 12 }}
          />
        </Typography>
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            fontSize: '15px',
          }}
        >
          © 2026 Penny
        </Typography>
      </Box>
    </Box>
  );
};
