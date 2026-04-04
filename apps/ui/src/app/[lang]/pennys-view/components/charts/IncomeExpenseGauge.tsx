'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useDashboardFilters } from '@/providers/FilterContext';

import { ApiError } from '@/utils/clientApiFetch';
import { IncomeExpenseRatioResponse } from 'schemas';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import { getIncomeExpenseRatio } from '@/requests/charts/getIncomeExpenseRatio';

export default function IncomeExpenseGauge() {
  const { appliedFilters, isInitialized } = useDashboardFilters();

  const [data, setData] = useState<IncomeExpenseRatioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!appliedFilters.startDate || !appliedFilters.endDate) return;

        const result = await getIncomeExpenseRatio({
          from: appliedFilters.startDate?.toISOString(),
          to: appliedFilters.endDate?.toISOString(),
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
            message: 'Please refresh the page',
            severity: 'error',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appliedFilters, isInitialized]);

  if (!isInitialized) return null;
  if (loading) return <Spinner fullScreen />;
  if (error) return <ErrorBanner error={error} />;
  if (!data) return <Typography>No data available</Typography>;

  const { income, expense, ratio } = data;

  // ---- Gauge config ----
  const MAX = Math.max(120, ratio); // dynamic cap
  const value = Math.min(ratio, MAX);

  const gaugeData = [
    { name: 'value', value },
    { name: 'rest', value: MAX - value },
  ];

  // Color logic
  const getColor = () => {
    if (ratio < 70) return '#4caf50';
    if (ratio < 100) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ width: '100%', mt: 3, textAlign: 'center' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Spending Ratio
      </Typography>

      <Box sx={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={gaugeData}
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor()} />
              <Cell fill="#e0e0e0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <Box
          sx={{
            position: 'relative',
            top: '-180px',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            {ratio.toFixed(0)}%
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {formatCurrency(expense)} / {formatCurrency(income)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
