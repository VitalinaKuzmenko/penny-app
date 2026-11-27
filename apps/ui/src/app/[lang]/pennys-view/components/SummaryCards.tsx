/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import { GetIncomeExpenseResponse } from 'schemas';
import { formatCurrency } from '@/utils/formatCurrency';
import incomeIcon from '../../../../../public/income_left_icon.png';
import incomePlant from '../../../../../public/income_right_plant.png';
import expenseIcon from '../../../../../public/expense_left_icon.png';
import expenseWallet from '../../../../../public/expense_right_wallet.png';
import savingsIcon from '../../../../../public/savings_left_icon.png';
import savingsCoins from '../../../../../public/savings_right_coins.png';

interface SummaryCardsProps {
  // same totals the Income vs Expense chart shows; null while loading or on error
  data: GetIncomeExpenseResponse | null;
  pennysViewPageText: Record<string, any>;
}

interface CardConfig {
  label: string;
  value: number | undefined;
  bg: string;
  icon: StaticImageData;
  illustration: StaticImageData;
}

export default function SummaryCards({
  data,
  pennysViewPageText,
}: SummaryCardsProps) {
  const names = pennysViewPageText.CHARTS.INCOME_EXPENSE.CHART_NAMES;

  const cards: CardConfig[] = [
    {
      label: names.INCOME,
      value: data?.income,
      bg: 'linear-gradient(135deg, #EEF8EC 0%, #E1F2DE 100%)',
      icon: incomeIcon,
      illustration: incomePlant,
    },
    {
      label: names.EXPENSE,
      // the chart shows expenses as a positive bar, so the card does too
      value: data ? Math.abs(data.expense) : undefined,
      bg: 'linear-gradient(135deg, #FDEFF1 0%, #FBE1E6 100%)',
      icon: expenseIcon,
      illustration: expenseWallet,
    },
    {
      label: names.SAVINGS,
      value: data?.savings,
      bg: 'linear-gradient(135deg, #F6EEFC 0%, #ECDFF9 100%)',
      icon: savingsIcon,
      illustration: savingsCoins,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        // three across on desktop; each card adapts to its own width
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
      }}
    >
      {cards.map((card) => (
        // container so the card layout reacts to its own width, not the screen
        <Box
          key={card.label}
          sx={{ containerType: 'inline-size', minWidth: 0 }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              overflow: 'hidden',
              borderRadius: '24px',
              background: card.bg,
              px: 2,
              py: 1.5,
              display: 'grid',
              alignItems: 'center',
              columnGap: 1.5,
              rowGap: 1,
              // wide card: icon | text | illustration on one row
              gridTemplateColumns: 'auto minmax(0, 1fr) auto',
              // narrow card: icon and illustration on top, text below
              '@container (max-width: 340px)': {
                gridTemplateColumns: 'auto 1fr',
                '& .card-text': { gridColumn: '1 / -1', gridRow: 2 },
                '& .card-art': { gridColumn: 2, gridRow: 1 },
              },
            }}
          >
            <Box
              sx={{
                width: 'clamp(44px, 16cqw, 64px)',
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
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="baseline"
                flexWrap="wrap"
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ color: 'secondary.main', lineHeight: 1.2 }}
                >
                  {card.label}
                </Typography>
              </Stack>
              <Typography
                component="p"
                sx={{
                  fontFamily: (t) => t.typography.h1.fontFamily,
                  fontWeight: 700,
                  fontSize: 'clamp(1.5rem, 9cqw, 1.9rem)',
                  lineHeight: 1.15,
                  color: 'secondary.main',
                }}
                noWrap
              >
                {card.value === undefined ? '—' : formatCurrency(card.value)}
              </Typography>
            </Box>

            <Box
              className="card-art"
              sx={{
                // capped so full-width cards (stacked layout) stay short
                width: 'clamp(70px, 30cqw, 100px)',
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
