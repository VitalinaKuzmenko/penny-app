'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import logo from '../../../public/Penny_logo_transparent.png';

export const Footer = () => {
  return (
    <Box
      sx={{
        minHeight: '160px',
        width: '100%',
        backgroundColor: 'sidebar.background',
        color: 'sidebar.text',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" component="a" href="/">
          <Image src={logo} alt="Penny" height={56} style={{ width: 'auto' }} />
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
