/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getMonthlyCategory } from '@/requests/charts/getMonthlyCategory';
import { ApiError } from '@/utils/clientApiFetch';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import { formatCurrency } from '@/utils/formatCurrency';
import { MonthlyCategoryResponse } from 'schemas';

export default function MonthlyCategoryChart() {
  const { appliedFilters, isInitialized } = useDashboardFilters();
  const [data, setData] = useState<MonthlyCategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const year = appliedFilters.startDate?.year() ?? new Date().getFullYear();

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getMonthlyCategory({
          year,
          accountIds: appliedFilters.accountIds,
          categoryIds: appliedFilters.categoryIds,
          type: 'EXPENSE',
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
            message: 'Failed to load chart. Please refresh.',
            severity: 'error',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    year,
    appliedFilters.accountIds,
    appliedFilters.categoryIds,
    isInitialized,
  ]);

  if (!isInitialized) return null;
  if (loading) return <Spinner fullScreen />;
  if (error) return <ErrorBanner error={error} />;
  if (!data) return <Typography>No data available</Typography>;

  // Transform data: each month as a row, each category as a key
  const chartData = data.labels.map((month: string, idx: number) => {
    const row: Record<string, any> = { month };
    data.datasets.forEach((ds: any) => {
      row[ds.categoryName] = ds.data[idx];
    });
    return row;
  });

  // Pick a palette for bars
  const colors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Monthly Spending by Category ({year})
      </Typography>

      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />

            {data.datasets.map((ds: any, index: number) => (
              <Bar
                key={ds.categoryId}
                dataKey={ds.categoryName}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
