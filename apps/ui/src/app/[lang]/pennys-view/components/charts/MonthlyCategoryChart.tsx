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
import { chartCategoryIds } from '@/utils/chartCategoryIds';
import { ApiError } from '@/utils/clientApiFetch';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { UiError } from '@/types/interfaces';
import { Category, MonthlyCategoryResponse } from 'schemas';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';
import {
  CategoryChartLegend,
  CategoryChartTooltip,
  ChartCategoryItem,
} from '@/components/CategoryChartLegend/CategoryChartLegend';
interface MonthlyCategoryChartProps {
  categories: Category[];
  pennysViewPageText: Record<string, any>;
}

export default function MonthlyCategoryChart({
  categories,
  pennysViewPageText,
}: MonthlyCategoryChartProps) {
  const { appliedFilters, isInitialized } = useDashboardFilters();
  const [data, setData] = useState<MonthlyCategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const year = appliedFilters.startDate?.year() ?? new Date().getFullYear();

  const categoryColorMap = Object.fromEntries(
    categories.map((c) => [c.id, c.color]),
  );

  useEffect(() => {
    if (!isInitialized) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getMonthlyCategory({
          year,
          accountIds: appliedFilters.accountIds,
          categoryIds: chartCategoryIds(appliedFilters.categoryIds, categories),
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
  }, [
    year,
    appliedFilters.accountIds,
    appliedFilters.categoryIds,
    categories,
    isInitialized,
  ]);

  if (!isInitialized) return null;
  if (loading) return <Spinner fullScreen />;
  if (error) return <ErrorBanner error={error} />;
  if (!data)
    return <Typography>{pennysViewPageText.ERRORS.CHARTS.NO_DATA}</Typography>;

  // Transform data: each month as a row, each category as a key
  const chartData = data.labels.map((month: string, idx: number) => {
    const row: Record<string, any> = { month };
    data.datasets.forEach((ds: any) => {
      row[ds.categoryName] = ds.data[idx];
    });
    return row;
  });

  const legendItems: ChartCategoryItem[] = data.datasets.map((ds: any) => ({
    id: ds.categoryId,
    name: ds.categoryName,
    color: categoryColorMap[ds.categoryId] || '#ccc',
  }));
  // bars are keyed by category name
  const legendItemByName = new Map(legendItems.map((i) => [i.name, i]));

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {`${pennysViewPageText.CHARTS.MONTHLY_SPENDING.TITLE} (${year})`}
        </Typography>

        <InfoTooltip
          content={
            <>
              <Typography variant="body2">
                {pennysViewPageText.CHARTS.MONTHLY_SPENDING.TOOLTIP_1}
              </Typography>

              <Typography variant="body2">
                {pennysViewPageText.CHARTS.MONTHLY_SPENDING.TOOLTIP_2}
              </Typography>
            </>
          }
        />
      </Box>

      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              content={(props) => (
                <CategoryChartTooltip
                  {...props}
                  categories={categories}
                  itemFor={(entry) => legendItemByName.get(entry.dataKey)}
                />
              )}
            />
            <Legend
              content={() => (
                <CategoryChartLegend
                  items={legendItems}
                  categories={categories}
                />
              )}
            />

            {data.datasets.map((ds: any) => (
              <Bar
                key={ds.categoryId}
                dataKey={ds.categoryName}
                fill={categoryColorMap[ds.categoryId] || '#ccc'}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
