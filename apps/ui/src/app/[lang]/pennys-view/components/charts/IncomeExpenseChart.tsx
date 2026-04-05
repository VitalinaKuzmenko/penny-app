'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getIncomeExpense } from '@/requests/charts/getIncomeExpense';
import { ApiError } from '@/utils/clientApiFetch';
import { GetIncomeExpenseResponse } from 'schemas';
import { formatCurrencyLabel } from '@/utils/formatCurrency';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import { useTheme } from '@mui/material/styles';

export default function IncomeExpenseChart() {
  const { appliedFilters, isInitialized } = useDashboardFilters();

  const [data, setData] = useState<GetIncomeExpenseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const theme = useTheme();

  const year = appliedFilters.startDate
    ? appliedFilters.startDate.year()
    : new Date().getFullYear();

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getIncomeExpense({
          year,
          accountIds: appliedFilters.accountIds,
        });
        setData(result);
      } catch (err) {
        if (err instanceof ApiError) {
          setError({
            title: err.message,
            message: err.message,
            severity: 'error',
          });
        } else {
          setError({
            title: 'Failed to load data',
            message:
              'Sorry, failed to load data. Please try to refresh the page',
            severity: 'error',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, appliedFilters.accountIds, isInitialized]);

  if (!isInitialized) return null;

  if (loading) return <Spinner fullScreen />;

  if (error) return <ErrorBanner error={error} />;
  if (!data) return <Typography>No data available</Typography>;

  const chartData = [
    { name: 'Income', value: data.income },
    { name: 'Expense', value: Math.abs(data.expense) },
    { name: 'Savings', value: data.savings },
  ];

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      {/* Title */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Income vs Expense ({year})
      </Typography>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />

            <Bar dataKey="value">
              <Cell fill={theme.palette.chart.income} />
              <Cell fill={theme.palette.chart.expense} />
              <Cell fill={theme.palette.chart.savings} />

              <LabelList
                dataKey="value"
                position="top"
                formatter={formatCurrencyLabel}
                fill={theme.palette.text.primary}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
