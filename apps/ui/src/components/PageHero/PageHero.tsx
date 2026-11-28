'use client';

import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import heart from '../../../public/heart.png';
import books from '../../../public/books.png';

interface PageHeroProps {
  title: string;
  subtitle: string;
}

// Page heading with the cosy illustration, shared by the import flow pages
export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <Box sx={{ position: 'relative', pb: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: { md: '58%' } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'secondary.main',
              fontSize: { xs: '2rem', md: '2.75rem' },
            }}
          >
            {title}
          </Typography>
          <Image src={heart} alt="" aria-hidden width={44} height={39} />
        </Stack>

        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          {subtitle}
        </Typography>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: -16,
          right: 0,
          width: 'min(40%, 480px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Image
          src={books}
          alt=""
          aria-hidden
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
    </Box>
  );
}
