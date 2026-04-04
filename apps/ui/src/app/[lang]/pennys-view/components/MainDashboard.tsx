'use client';

import { Typography, Box } from '@mui/material';
import DashboardFilters from './filters/DashboardFilters';
import { Account, Category } from 'schemas';
import { UiError } from '@/types/interfaces';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import { useDashboardFilters } from '@/providers/FilterContext';
import { useEffect } from 'react';
import Spinner from '@/components/ui/Spinner/Spinner';
import MonthlyCategoryChart from './charts/MonthlyCategoryChart';
import MonthlyCategoryTable from './charts/MonthlyCategoryTable';

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
  const { initFilters, isInitialized } = useDashboardFilters();

  useEffect(() => {
    if (!isInitialized) {
      initFilters({
        categoryIds: categories.map((c) => c.id),
        accountIds: accounts.map((a) => a.id),
      });
    }
  }, [accounts, categories, isInitialized]);

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

      {/* Charts */}
      <Box>
        {!isInitialized ? (
          <Spinner fullScreen />
        ) : (
          <Box>
            <IncomeExpenseChart />
            <MonthlyCategoryChart />
            <MonthlyCategoryTable />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainDashboard;
