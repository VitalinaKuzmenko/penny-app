/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Stack } from '@mui/material';
import DashboardFilters from './filters/DashboardFilters';
import { AccountWithActivity, Category } from 'schemas';
import { UiError } from '@/types/interfaces';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import { useDashboardFilters } from '@/providers/FilterContext';
import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner/Spinner';
import MonthlyCategoryChart from './charts/MonthlyCategoryChart';
import MonthlyCategoryTable from './charts/MonthlyCategoryTable';
import CategoryBreakdownChart from './charts/CategoryBreakdownChart';
import IncomeExpenseStackedChart from './charts/IncomeExpenseStackedChart';
import IncomeExpenseGauge from './charts/IncomeExpenseGauge';
import TagSpendChart from './charts/TagSpendChart';
import DashboardCard from './DashboardCard';
import SummaryCards from './SummaryCards';
import PageHero from '@/components/PageHero/PageHero';
import { GetIncomeExpenseResponse } from 'schemas';

interface MainDashboardProps {
  accounts: AccountWithActivity[];
  categories: Category[];
  serverErrors: UiError[] | null;
  pennysViewPageText: Record<string, any>;
}

const MainDashboard = ({
  accounts,
  categories,
  serverErrors,
  pennysViewPageText,
}: MainDashboardProps) => {
  const { initFilters, isInitialized, appliedFilters } = useDashboardFilters();
  const [incomeExpense, setIncomeExpense] =
    useState<GetIncomeExpenseResponse | null>(null);
  // same year rule as the Income vs Expense chart
  const year = appliedFilters.startDate?.year() ?? new Date().getFullYear();

  useEffect(() => {
    if (!isInitialized) {
      initFilters({
        categoryIds: categories.map((c) => c.id),
        accountIds: accounts.map((a) => a.id),
      });
    }
  }, [accounts, categories, isInitialized]);

  return (
    <Box>
      <PageHero
        title={pennysViewPageText.TITLE}
        subtitle={pennysViewPageText.SUBTITLE}
      />

      {/* Error display */}
      {serverErrors &&
        serverErrors.length > 0 &&
        serverErrors.map((error) => (
          <ErrorBanner key={error.message} error={error} />
        ))}

      <DashboardFilters
        accounts={accounts}
        categories={categories}
        pennysViewPageText={pennysViewPageText}
      />

      {/* Charts */}
      {!isInitialized ? (
        <Spinner fullScreen />
      ) : (
        <Stack spacing={2.5}>
          <SummaryCards
            data={incomeExpense}
            year={year}
            pennysViewPageText={pennysViewPageText}
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1.2fr) minmax(0, 0.85fr) minmax(0, 1.15fr)',
              },
            }}
          >
            <Box>
              <DashboardCard>
                <IncomeExpenseChart
                  pennysViewPageText={pennysViewPageText}
                  onData={setIncomeExpense}
                />
              </DashboardCard>
            </Box>
            <DashboardCard>
              <IncomeExpenseGauge pennysViewPageText={pennysViewPageText} />
            </DashboardCard>
            <DashboardCard>
              <CategoryBreakdownChart
                categories={categories}
                pennysViewPageText={pennysViewPageText}
              />
            </DashboardCard>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            <DashboardCard>
              <IncomeExpenseStackedChart
                pennysViewPageText={pennysViewPageText}
              />
            </DashboardCard>
            <DashboardCard>
              <MonthlyCategoryChart
                categories={categories}
                pennysViewPageText={pennysViewPageText}
              />
            </DashboardCard>
          </Box>

          <DashboardCard>
            <MonthlyCategoryTable
              categories={categories}
              pennysViewPageText={pennysViewPageText}
            />
          </DashboardCard>

          <DashboardCard>
            <TagSpendChart pennysViewPageText={pennysViewPageText} />
          </DashboardCard>
        </Stack>
      )}
    </Box>
  );
};

export default MainDashboard;
