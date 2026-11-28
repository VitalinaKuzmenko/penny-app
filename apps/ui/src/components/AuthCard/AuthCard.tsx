'use client';

import { FormEventHandler, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import logo from '../../../public/Penny_logo_transparent.png';
import scene from '../../../public/books.png';
import heart from '../../../public/heart_2.png';

interface AuthCardProps {
  title: string;
  subtitle: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  // rendered under the card, e.g. an error banner
  below?: ReactNode;
}

// Shared look for the sign-in and register pages: logo, rounded card with the
// cosy illustration, heading and lavender form fields
export default function AuthCard({
  title,
  subtitle,
  onSubmit,
  children,
  below,
}: AuthCardProps) {
  return (
    <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
      {/* logo is tinted plum with a mask: the shared logo file is cream-coloured */}
      <Box
        component="a"
        href="/"
        aria-label="Penny"
        sx={{
          display: 'block',
          width: 110,
          aspectRatio: `${logo.width} / ${logo.height}`,
          mx: 'auto',
          mb: 1,
          bgcolor: 'secondary.main',
          maskImage: `url(${logo.src})`,
          WebkitMaskImage: `url(${logo.src})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />

      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: '100%',
          mb: 2,
          p: { xs: 2, sm: 3 },
          borderRadius: '28px',
          boxShadow: '0 8px 32px rgba(83, 36, 70, 0.1)',
          bgcolor: '#FFFBF9',
          // lavender, rounded inputs as in the design
          '& .MuiOutlinedInput-root': {
            bgcolor: '#F7EEFD',
            borderRadius: '14px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#DCC8F0',
            },
          },
          // keep error text short so the card doesn't jump
          '& .MuiFormHelperText-root': { mt: 0.25, mx: 1, fontSize: '0.72rem' },
        }}
      >
        <Image
          src={scene}
          alt=""
          aria-hidden
          priority
          style={{
            display: 'block',
            width: '72%',
            height: 'auto',
            margin: '0 auto',
            // the artwork has a faint backdrop; fading its edges blends it into the card
            maskImage:
              'radial-gradient(ellipse at center, #000 62%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, #000 62%, transparent 100%)',
          }}
        />

        <Box sx={{ textAlign: 'center', mt: 0.5 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'secondary.main',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
            }}
          >
            {title}{' '}
            <Image
              src={heart}
              alt=""
              aria-hidden
              width={90}
              height={60}
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                margin: '-14px -26px -14px -22px',
              }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>

        {children}
      </Box>

      {below}
    </Box>
  );
}
