/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getIncomeExpenseStacked } from '@/requests/charts/getIncomeExpenseStacked';
import { ApiError } from '@/utils/clientApiFetch';
import { IncomeExpenseStackedResponse } from 'schemas';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';

interface IncomeExpenceStackedChartProps {
  pennysViewPageText: Record<string, any>;
}

export default function IncomeExpenseStackedChart({
  pennysViewPageText,
}: IncomeExpenceStackedChartProps) {
  const { appliedFilters, isInitialized } = useDashboardFilters();

  const [data, setData] = useState<IncomeExpenseStackedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const theme = useTheme();

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getIncomeExpenseStacked({
          startDate: appliedFilters.startDate?.toISOString(),
          endDate: appliedFilters.endDate?.toISOString(),
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
            title: `${pennysViewPageText.ERRORS.CHARTS.LOAD_DATA.TITLE}`,
            message: `${pennysViewPageText.ERRORS.CHARTS.LOAD_DATA.MESSAGE}`,
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
  if (!data || !data.length)
    return <Typography>{pennysViewPageText.ERRORS.CHARTS.NO_DATA}</Typography>;

  // Format month label → "Jan 2026"
  const chartData = data.map((item) => {
    const [year, month] = item.month.split('-');

    const date = new Date(Number(year), Number(month) - 1);

    return {
      ...item,
      label: date.toLocaleString('en-GB', {
        month: 'short',
        year: 'numeric',
      }),
    };
  });

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {pennysViewPageText.CHARTS.INCOME_EXPENSE_STACKED.TITLE}
        </Typography>

        <InfoTooltip
          content={
            <Typography variant="body2">
              {pennysViewPageText.CHARTS.INCOME_EXPENSE_STACKED.TOOLTIP}
            </Typography>
          }
        />
      </Box>

      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis />

            <Tooltip formatter={(value) => formatCurrency(value)} />

            <Legend />

            {/* Stacked bars */}
            <Bar
              dataKey="income"
              stackId="total"
              fill={theme.palette.chart.income}
            />
            <Bar
              dataKey="expense"
              stackId="total"
              fill={theme.palette.chart.expense}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
