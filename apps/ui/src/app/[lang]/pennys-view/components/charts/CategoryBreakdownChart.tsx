'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getCategoryBreakdown } from '@/requests/charts/getCategoryBreakdown';
import { ApiError } from '@/utils/clientApiFetch';
import { Category, CategoryBreakdownResponse } from 'schemas';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';

interface CategoryBreakdownChartProps {
  categories: Category[];
}

export default function CategoryBreakdownChart({
  categories,
}: CategoryBreakdownChartProps) {
  const { appliedFilters, isInitialized } = useDashboardFilters();

  const [data, setData] = useState<CategoryBreakdownResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<UiError | null>(null);

  const categoryColorMap = Object.fromEntries(
    categories.map((c) => [c.id, c.color]),
  );

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getCategoryBreakdown({
          startDate: appliedFilters.startDate?.toISOString(),
          endDate: appliedFilters.endDate?.toISOString(),
          accountIds: appliedFilters.accountIds,
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
  if (!data || !data.categories.length)
    return <Typography>No data available</Typography>;

  // 🔑 Transform API → chart format
  const chartData = data.categories
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({
      categoryId: c.categoryId,
      name: c.categoryName,
      value: c.amount,
      percentage: c.percentage,
    }));

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Category Breakdown
        </Typography>

        <InfoTooltip
          content={
            <Typography variant="body2">
              Shows how your total spending is distributed across categories for
              the selected period.
            </Typography>
          }
        />
      </Box>

      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              labelLine={false}
              label={({
                cx = 0,
                cy = 0,
                midAngle = 0,
                innerRadius = 0,
                outerRadius = 0,
                percent = 0,
              }) => {
                if (percent < 0.03) return null;

                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {(percent * 100).toFixed(0)}%
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={categoryColorMap[entry.categoryId] || '#ccc'}
                />
              ))}
            </Pie>

            <Tooltip formatter={(value) => formatCurrency(value)} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
