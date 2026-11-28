'use client';

import { Box, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import lock from '../../../public/home_page2.png';
import csv from '../../../public/home_page3.png';
import sparkle from '../../../public/home_page4.png';
import bars from '../../../public/home_page5.png';

const icons = [lock, csv, sparkle, bars];

export default function HomeFeaturesSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const features: { TITLE: string; DESCRIPTION: string }[] =
    homePageText.FEATURES_SECTION.FEATURES;

  return (
    <Paper
      sx={{
        mt: { xs: 3, md: 4 },
        p: { xs: 2, md: 2.5 },
        borderRadius: '24px',
        bgcolor: '#FFFBF9',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {features.map((feature, index) => (
          <Box
            key={feature.TITLE}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: { lg: 1.5 },
              borderLeft: { lg: index > 0 ? '1px solid' : 'none' },
              borderColor: 'rgba(83, 36, 70, 0.08)',
              minWidth: 0,
            }}
          >
            <Image
              src={icons[index]}
              alt=""
              aria-hidden
              style={{
                width: 76,
                height: 76,
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} color="secondary.main">
                {feature.TITLE}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.DESCRIPTION}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
