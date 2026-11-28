'use client';

import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';

export interface StatCardItem {
  label: string;
  // already formatted (e.g. "£1,234" or "44"); "—" while loading
  value: string;
  valueColor?: string;
  tooltip?: ReactNode;
  bg: string;
  icon: StaticImageData;
  illustration: StaticImageData;
}

interface StatCardsProps {
  items: StatCardItem[];
  // grid-template-columns, e.g. { xs: '1fr', md: 'repeat(3, 1fr)' }
  columns: Record<string, string>;
}

// Colourful summary cards (icon, label, big value, illustration) used on
// Penny's View and the Money Journal
export default function StatCards({ items, columns }: StatCardsProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1, sm: 2 },
        // each card adapts to its own width, so any column count works
        gridTemplateColumns: columns,
      }}
    >
      {items.map((card) => (
        // container so the card layout reacts to its own width, not the screen
        <Box
          key={card.label}
          sx={{ containerType: 'inline-size', minWidth: 0 }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px',
              background: card.bg,
              px: 2,
              py: 1.5,
              display: 'grid',
              alignItems: 'center',
              columnGap: 1.5,
              rowGap: 1,
              // one layout at every width (icon | text | illustration); sizes
              // scale with the card, and pages only add columns when cards
              // stay wide enough, so the look never flips back and forth
              gridTemplateColumns: 'auto minmax(0, 1fr) auto',
              // narrow cards (e.g. four across on laptops): same layout, but the
              // illustration tucks into the corner behind the text to free space
              '@container (max-width: 280px)': {
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                px: 1.5,
                columnGap: 1,
                '& .card-icon': { width: 36 },
                '& .card-text': { position: 'relative', zIndex: 1 },
                '& .card-label': { fontSize: '1rem' },
                '& .card-value': { fontSize: '1.2rem' },
                '& .card-art': {
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: 56,
                  m: 0,
                },
              },
              // phones: one slim row (icon | label + value | small art) so the
              // stacked cards don't fill the screen
              '@media (max-width: 599.95px)': {
                gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                py: 0.75,
                pl: 1.5,
                borderRadius: '16px',
                '& .card-text': {
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 1,
                },
                '& .card-art': {
                  width: 40,
                  m: '-4px -4px -8px 0',
                },
                '& .card-icon': { width: 32 },
                '& .card-label': { fontSize: '1rem' },
                '& .card-value': { fontSize: '1.25rem' },
              },
            }}
          >
            <Box
              className="card-icon"
              sx={{
                width: 'clamp(40px, 15cqw, 64px)',
                aspectRatio: '1',
                display: 'flex',
              }}
            >
              <Image
                src={card.icon}
                alt=""
                aria-hidden
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>

            <Box className="card-text" sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  className="card-label"
                  variant="h6"
                  component="h2"
                  sx={{ color: 'secondary.main', lineHeight: 1.2 }}
                >
                  {card.label}
                </Typography>
                {card.tooltip && <InfoTooltip content={card.tooltip} />}
              </Stack>
              <Typography
                className="card-value"
                component="p"
                sx={{
                  // figures use the body font (Nunito Sans), not the heading serif
                  fontFamily: (t) => t.typography.fontFamily,
                  fontWeight: 800,
                  fontSize: 'clamp(1.25rem, 8cqw, 1.9rem)',
                  lineHeight: 1.15,
                  color: card.valueColor ?? 'secondary.main',
                }}
                noWrap
              >
                {card.value}
              </Typography>
            </Box>

            <Box
              className="card-art"
              sx={{
                // capped so full-width cards (stacked layout) stay short
                width: 'clamp(56px, 26cqw, 100px)',
                // same box for every illustration so all cards are equally tall
                aspectRatio: '1',
                justifySelf: 'end',
                // lets the illustration sit close to the card corner
                m: '-8px -8px -12px 0',
                pointerEvents: 'none',
              }}
            >
              <Image
                src={card.illustration}
                alt=""
                aria-hidden
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'right bottom',
                  display: 'block',
                }}
              />
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
