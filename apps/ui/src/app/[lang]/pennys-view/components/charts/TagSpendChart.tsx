/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TagSpendResponse } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getTagSpend } from '@/requests/charts/getTagSpend';
import { formatCurrency } from '@/utils/formatCurrency';
import { interpolate } from '@/utils/interpolate';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';
import { UiError } from '@/types/interfaces';

const LABEL_MAX_CHARS = 18;
const BAR_HEIGHT = 36;

const truncate = (name: string) =>
  name.length > LABEL_MAX_CHARS
    ? `${name.slice(0, LABEL_MAX_CHARS - 1)}…`
    : name;

interface TagSpendChartProps {
  pennysViewPageText: Record<string, any>;
}

// Follows only the dashboard's dates: tags are events that cut across accounts and categories
export default function TagSpendChart({
  pennysViewPageText,
}: TagSpendChartProps) {
  const { appliedFilters, isInitialized } = useDashboardFilters();
  const text = pennysViewPageText.CHARTS.TAG_SPEND;

  const startDate = appliedFilters.startDate?.toISOString();
  const endDate = appliedFilters.endDate?.toISOString();
  const requestKey = `${startDate}|${endDate}`;

  // keyed by request, so a newer date range shows the spinner until its data arrives
  const [result, setResult] = useState<{
    key: string;
    data?: TagSpendResponse;
    failed?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    let cancelled = false;

    getTagSpend({ startDate, endDate })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, startDate, endDate, isInitialized]);

  if (!isInitialized) return null;

  const loading = result?.key !== requestKey;
  const data = result?.data;
  const error: UiError | null = result?.failed
    ? {
        severity: 'error',
        title: pennysViewPageText.ERRORS.CHARTS.LOAD_DATA.TITLE,
        message: pennysViewPageText.ERRORS.CHARTS.LOAD_DATA.MESSAGE,
      }
    : null;

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {text.TITLE}
        </Typography>
        <InfoTooltip
          content={<Typography variant="body2">{text.TOOLTIP}</Typography>}
        />
      </Box>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBanner error={error} />
      ) : !data?.length ? (
        <Typography color="text.secondary">{text.EMPTY}</Typography>
      ) : (
        <Box sx={{ width: '100%', height: data.length * BAR_HEIGHT + 40 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 24 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v) as string}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tickFormatter={truncate}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as
                    | TagSpendResponse[number]
                    | undefined;
                  if (!active || !item) return null;
                  return (
                    <Paper sx={{ p: 1.5, maxWidth: 320 }}>
                      <Typography fontWeight={600}>{item.name}</Typography>
                      <Typography variant="body2">
                        {formatCurrency(item.spent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {interpolate(text.COUNT, { count: item.count })}
                      </Typography>
                    </Paper>
                  );
                }}
              />
              <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((t) => (
                  <Cell key={t.tagId} fill={t.color ?? '#9e9e9e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
