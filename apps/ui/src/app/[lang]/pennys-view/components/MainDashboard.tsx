'use client';

import { Typography, Box } from '@mui/material';
import DashboardFilters from './DashboardFilters';
import { Account, Category } from 'schemas';
import { UiError } from '@/types/interfaces';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';

interface MainDashboardProps {
  accounts: Account[];
  categories: Category[];
  serverErrors: UiError[] | null;
}

const MainDashboard = ({
  accounts,
  categories,
  serverErrors,
}: MainDashboardProps) => {
  return (
    <Box sx={{ p: { xs: 3, md: 3 } }}>
      {/* Hero */}
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Penny&apos;s View
        </Typography>
      </Box>

      {/* Error display */}
      {serverErrors &&
        serverErrors.length > 0 &&
        serverErrors.map((error) => (
          <ErrorBanner key={error.message} error={error} />
        ))}

      <DashboardFilters accounts={accounts} categories={categories} />
    </Box>
  );
};

export default MainDashboard;
