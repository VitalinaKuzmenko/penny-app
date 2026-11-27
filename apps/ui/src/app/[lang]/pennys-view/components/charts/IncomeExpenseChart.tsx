/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ChartCardTitle } from '../DashboardCard';
import BarChartRounded from '@mui/icons-material/BarChartRounded';

interface IncomeExpenseChartProps {
  pennysViewPageText: Record<string, any>;
  // lets the summary cards reuse this chart's totals instead of fetching again
  onData?: (data: GetIncomeExpenseResponse | null) => void;
}

export default function IncomeExpenseChart({
  pennysViewPageText,
  onData,
}: IncomeExpenseChartProps) {
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
      onData?.(null);

      try {
        const result = await getIncomeExpense({
          year,
          accountIds: appliedFilters.accountIds,
        });
        setData(result);
        onData?.(result);
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
  if (!data)
    return <Typography>{pennysViewPageText.ERRORS.CHARTS.NO_DATA}</Typography>;

  const chartData = [
    {
      name: `${pennysViewPageText.CHARTS.INCOME_EXPENSE.CHART_NAMES.INCOME}`,
      value: data.income,
    },
    {
      name: `${pennysViewPageText.CHARTS.INCOME_EXPENSE.CHART_NAMES.EXPENSE}`,
      value: Math.abs(data.expense),
    },
    {
      name: `${pennysViewPageText.CHARTS.INCOME_EXPENSE.CHART_NAMES.SAVINGS}`,
      value: data.savings,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <ChartCardTitle
        icon={<BarChartRounded fontSize="inherit" />}
        title={`${pennysViewPageText.CHARTS.INCOME_EXPENSE.TITLE} (${year})`}
        tooltip={
          <>
            <Typography variant="body2">
              {pennysViewPageText.CHARTS.INCOME_EXPENSE.TOOLTIP_1}
            </Typography>
            <Typography variant="body2">
              {pennysViewPageText.CHARTS.INCOME_EXPENSE.TOOLTIP_2}
            </Typography>
          </>
        }
      />

      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 24, right: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={false}
            />

            <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={110}>
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
