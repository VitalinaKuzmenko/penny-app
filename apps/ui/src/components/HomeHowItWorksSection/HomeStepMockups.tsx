/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ReactNode } from 'react';
import { Box, Button, Checkbox, Stack, Typography } from '@mui/material';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import RestaurantRounded from '@mui/icons-material/RestaurantRounded';
import DirectionsCarRounded from '@mui/icons-material/DirectionsCarRounded';
import MovieRounded from '@mui/icons-material/MovieRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';

interface StepCardProps {
  number: number;
  label: string;
  children: ReactNode;
}

// Card with the numbered pill label overlapping its top-left corner
function StepCard({ number, label, children }: StepCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // same minimum height everywhere; on wide screens the row also
        // stretches every card to the tallest one
        minHeight: 210,
        display: 'flex',
        flexDirection: 'column',
        pt: 4.5,
        px: 1.5,
        pb: 1.5,
        borderRadius: '20px',
        bgcolor: '#FFFBF9',
        boxShadow: '0 4px 18px rgba(83, 36, 70, 0.1)',
        textAlign: 'left',
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{
          position: 'absolute',
          top: -14,
          left: 14,
          pl: 0.5,
          pr: 1.75,
          py: 0.5,
          borderRadius: 999,
          bgcolor: '#EEDDF8',
          boxShadow: '0 2px 8px rgba(83, 36, 70, 0.12)',
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            color: 'common.white',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {number}
        </Box>
        <Typography
          variant="body2"
          fontWeight={700}
          color="secondary.main"
          noWrap
        >
          {label}
        </Typography>
      </Stack>
      {/* content is centred in the space left under the pill */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function UploadStepMock({ label, mock }: { label: string; mock: any }) {
  return (
    <StepCard number={1} label={label}>
      <Box
        sx={{
          py: 2.5,
          px: 1.5,
          borderRadius: '14px',
          border: '1.5px dashed',
          borderColor: 'secondary.light',
          bgcolor: '#F3E4FC',
          textAlign: 'center',
        }}
      >
        <CloudUploadOutlined sx={{ fontSize: 44, color: '#A47ED8' }} />
        <Typography fontWeight={700} color="secondary.main" lineHeight={1.2}>
          {mock.DROP}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {mock.OR}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          {/* decorative: shows what the upload page looks like */}
          <Button
            component="span"
            variant="contained"
            color="secondary"
            size="small"
            tabIndex={-1}
            startIcon={<InsertDriveFileOutlined />}
            sx={{ pointerEvents: 'none', borderRadius: '10px', fontSize: 12 }}
          >
            {mock.CHOOSE}
          </Button>
        </Box>
      </Box>
    </StepCard>
  );
}

const CATEGORY_STYLES = [
  { icon: <RestaurantRounded />, color: '#C25E00', bg: '#FFE9D2' },
  { icon: <DirectionsCarRounded />, color: '#3B5BDB', bg: '#E3E9FB' },
  { icon: <MovieRounded />, color: '#7B3FBF', bg: '#EDE3FA' },
];

export function ReviewStepMock({ label, mock }: { label: string; mock: any }) {
  const rows: { DATE: string; DESCRIPTION: string; CATEGORY: string }[] =
    mock.ROWS;
  const columns: string[] = mock.COLUMNS;
  const grid = '28px 0.8fr 1.2fr 1.5fr';

  return (
    <StepCard number={2} label={label}>
      <Box sx={{ fontSize: 12 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: grid,
            alignItems: 'center',
            px: 0.5,
            py: 0.5,
            borderRadius: '8px',
            bgcolor: '#F5EAFB',
            fontWeight: 700,
            color: 'secondary.main',
          }}
        >
          <span />
          {columns.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </Box>
        {rows.map((row, i) => {
          const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
          return (
            <Box
              key={row.DESCRIPTION}
              sx={{
                display: 'grid',
                gridTemplateColumns: grid,
                alignItems: 'center',
                px: 0.5,
                py: 0.5,
                borderBottom: i < rows.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              <Checkbox
                checked
                size="small"
                disableRipple
                tabIndex={-1}
                sx={{
                  p: 0,
                  color: 'secondary.main',
                  '&.Mui-checked': { color: 'secondary.main' },
                  pointerEvents: 'none',
                }}
                inputProps={{ 'aria-hidden': true }}
              />
              <span>{row.DATE}</span>
              <Box component="span" sx={{ pr: 0.5, minWidth: 0 }}>
                {row.DESCRIPTION}
              </Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor: style.bg,
                  color: style.color,
                  fontWeight: 600,
                  minWidth: 0,
                  '& svg': { fontSize: 14 },
                }}
              >
                {style.icon}
                <Box
                  component="span"
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.CATEGORY}
                </Box>
                <ExpandMoreRounded />
              </Stack>
            </Box>
          );
        })}
      </Box>
    </StepCard>
  );
}

// Illustrative figures only, as in a product screenshot
const DONUT = `conic-gradient(
  #F2616F 0 22%, #FFB020 22% 40%, #4CAF50 40% 58%,
  #38BDF8 58% 74%, #A47ED8 74% 88%, #EC4899 88% 100%
)`;

export function InsightsStepMock({
  label,
  mock,
}: {
  label: string;
  mock: any;
}) {
  return (
    <StepCard number={3} label={label}>
      <Box
        sx={{
          p: 1,
          borderRadius: '14px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" fontWeight={700} color="text.primary">
          {mock.CHART_TITLE}
        </Typography>
        <Stack
          direction="row"
          alignItems="flex-end"
          spacing={1.5}
          sx={{ mt: 0.5 }}
        >
          <Stack
            direction="row"
            alignItems="flex-end"
            spacing={1}
            sx={{ flex: 1 }}
          >
            {[
              {
                name: mock.INCOME,
                value: '£4,300',
                height: 64,
                color: '#10B981',
              },
              {
                name: mock.EXPENSE,
                value: '£3,480',
                height: 52,
                color: '#F2616F',
              },
            ].map((bar) => (
              <Box
                key={bar.name}
                sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700 }} noWrap>
                  {bar.value}
                </Typography>
                <Box
                  sx={{
                    height: bar.height,
                    borderRadius: '6px 6px 0 0',
                    bgcolor: bar.color,
                  }}
                />
                <Typography sx={{ fontSize: 10 }} color="text.secondary" noWrap>
                  {bar.name}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Box
            aria-hidden
            sx={{
              width: 64,
              height: 64,
              mb: 1.5,
              flexShrink: 0,
              borderRadius: '50%',
              background: DONUT,
              // punches the centre out to make a donut
              mask: 'radial-gradient(circle, transparent 46%, #000 47%)',
              WebkitMask: 'radial-gradient(circle, transparent 46%, #000 47%)',
            }}
          />
        </Stack>
      </Box>
    </StepCard>
  );
}
