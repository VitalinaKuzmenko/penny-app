'use client';

import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';

interface ChartCardTitleProps {
  icon: ReactNode;
  title: string;
  tooltip?: ReactNode;
  // right side of the header, e.g. a legend
  action?: ReactNode;
}

// Icon + plum heading + optional info tooltip, shared by every dashboard card
export function ChartCardTitle({
  icon,
  title,
  tooltip,
  action,
}: ChartCardTitleProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ mb: 1.5, minWidth: 0 }}
    >
      <Box sx={{ display: 'flex', color: 'secondary.main', fontSize: 28 }}>
        {icon}
      </Box>
      <Typography
        variant="h6"
        component="h2"
        sx={{ color: 'secondary.main', minWidth: 0 }}
      >
        {title}
      </Typography>
      {tooltip && <InfoTooltip content={tooltip} />}
      {action && <Box sx={{ ml: 'auto !important' }}>{action}</Box>}
    </Stack>
  );
}

interface DashboardCardProps {
  children: ReactNode;
}

// Rounded white card that groups one dashboard section
export default function DashboardCard({ children }: DashboardCardProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: '24px',
        bgcolor: '#FFFBF9',
        minWidth: 0,
        height: '100%',
      }}
    >
      {children}
    </Paper>
  );
}
