/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useDashboardFilters } from '@/providers/FilterContext';

import { ApiError } from '@/utils/clientApiFetch';
import { IncomeExpenseRatioResponse } from 'schemas';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import { getIncomeExpenseRatio } from '@/requests/charts/getIncomeExpenseRatio';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';

interface IncomeExpenseGaugeProps {
  pennysViewPageText: Record<string, any>;
}

export default function IncomeExpenseGauge({
  pennysViewPageText,
}: IncomeExpenseGaugeProps) {
  const { appliedFilters, isInitialized } = useDashboardFilters();

  const [data, setData] = useState<IncomeExpenseRatioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const theme = useTheme();

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!appliedFilters.startDate || !appliedFilters.endDate) return;

        const result = await getIncomeExpenseRatio({
          startDate: appliedFilters.startDate?.toISOString(),
          endDate: appliedFilters.endDate?.toISOString(),
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
  if (!data)
    return <Typography>{pennysViewPageText.ERRORS.CHARTS.NO_DATA}</Typography>;

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
    if (ratio < 70) return theme.palette.success.main;
    if (ratio < 100) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ width: '100%', mt: 3, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {pennysViewPageText.CHARTS.SPENDING_RATIO.TITLE}
        </Typography>

        <InfoTooltip
          content={
            <Typography variant="body2">
              {pennysViewPageText.CHARTS.SPENDING_RATIO.TOOLTIP}
            </Typography>
          }
        />
      </Box>

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
