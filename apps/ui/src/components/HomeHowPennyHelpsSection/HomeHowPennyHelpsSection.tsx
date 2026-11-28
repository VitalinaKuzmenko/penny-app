'use client';

import { Box, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import upload from '../../../public/home_page6.png';
import categorize from '../../../public/home_page7.png';
import chart from '../../../public/home_page8.png';
import cat from '../../../public/home_page9.png';
import sparkLines from '../../../public/icon_right_trans.png';

const illustrations = [upload, categorize, chart, cat];

export default function HomeHowPennyHelpsSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const text = homePageText.HOW_PENNY_HELPS_SECTION;
  const items: { TITLE: string; DESCRIPTION: string }[] = text.ITEMS;

  return (
    <Box sx={{ mt: { xs: 5, md: 7 }, textAlign: 'center' }}>
      <Typography
        variant="h3"
        component="h2"
        sx={{
          color: 'secondary.main',
          fontSize: { xs: '1.8rem', md: '2.3rem' },
          position: 'relative',
          display: 'inline-block',
        }}
      >
        {text.TITLE}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: { xs: -34, md: -42 },
            right: { xs: -54, md: -70 },
            width: { xs: 80, md: 100 },
            pointerEvents: 'none',
          }}
        >
          <Image
            src={sparkLines}
            alt=""
            aria-hidden
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {text.SUBTITLE}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          textAlign: 'center',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {items.map((item, index) => (
          <Paper
            key={item.TITLE}
            sx={{
              p: 2.5,
              borderRadius: '24px',
              bgcolor: '#FFFBF9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box sx={{ height: 140, display: 'flex', alignItems: 'center' }}>
              <Image
                src={illustrations[index]}
                alt=""
                aria-hidden
                style={{
                  height: '100%',
                  width: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography variant="h6" component="h3" color="secondary.main">
              {item.TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.DESCRIPTION}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
