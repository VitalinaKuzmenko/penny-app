'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import logo from '../../../public/penny_logo.svg';

export const Footer = () => {
  return (
    <Box
      sx={{
        minHeight: '200px',
        backgroundColor: 'primary.main',
        color: 'white',
        border: '3px solid black',
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
            width={90}
            height={90}
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
