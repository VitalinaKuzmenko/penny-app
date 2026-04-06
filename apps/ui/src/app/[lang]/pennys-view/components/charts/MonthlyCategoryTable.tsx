/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridValueFormatter } from '@mui/x-data-grid';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getMonthlyCategory } from '@/requests/charts/getMonthlyCategory';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { formatCurrency } from '@/utils/formatCurrency';
import { UiError } from '@/types/interfaces';
import { ApiError } from '@/utils/clientApiFetch';
import { Category, MonthlyCategoryResponse } from 'schemas';
import { hexToRgba } from '@/utils/hexToRgba';
import InfoTooltip from '@/components/InfoTooltip/InfoTooltip';

interface MonthlyCategoryTableProps {
  categories: Category[];
  pennysViewPageText: Record<string, any>;
}

export default function MonthlyCategoryTable({
  categories,
  pennysViewPageText,
}: MonthlyCategoryTableProps) {
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
    isInitialized,
  ]);

  if (!isInitialized) return null;
  if (loading) return <Spinner fullScreen />;
  if (error) return <ErrorBanner error={error} />;
  if (!data)
    return <Typography>{pennysViewPageText.ERRORS.CHARTS.NO_DATA}</Typography>;

  const rows = data.labels.map((month: string, idx: number) => {
    const row: any = { id: idx, month };
    let monthTotal = 0;
    data.datasets.forEach((ds: any) => {
      row[ds.categoryName] = ds.data[idx];
      monthTotal += ds.data[idx];
    });
    row.total = monthTotal;
    return row;
  });

  const categoryCols: GridColDef[] = data.datasets.map((ds: any) => ({
    field: ds.categoryName,
    headerName: ds.categoryName,
    width: 120,
    valueFormatter: ((value) =>
      formatCurrency(value ?? 0)) as GridValueFormatter,

    cellClassName: `category-${ds.categoryId}`,
  }));

  const columns: GridColDef[] = [
    {
      field: 'month',
      headerName: `${pennysViewPageText.CHARTS.MONTHLY_SPENDING_TABLE.COLUMNS.MONTH}`,
      width: 100,
      cellClassName: 'month-cell',
    },
    ...categoryCols,
    {
      field: 'total',
      headerName: `${pennysViewPageText.CHARTS.MONTHLY_SPENDING_TABLE.COLUMNS.TOTAL}`,
      width: 120,
      valueFormatter: (value) =>
        formatCurrency(typeof value === 'number' ? value : 0),
      cellClassName: (params) => (params.value > 5000 ? 'high-total' : ''),
    },
  ];

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {`${pennysViewPageText.CHARTS.MONTHLY_SPENDING_TABLE.TITLE} (${year})`}
        </Typography>

        <InfoTooltip
          content={
            <>
              <Typography variant="body2">
                {pennysViewPageText.CHARTS.MONTHLY_SPENDING_TABLE.TOOLTIP_1}
              </Typography>

              <Typography variant="body2">
                {pennysViewPageText.CHARTS.MONTHLY_SPENDING_TABLE.TOOLTIP_2}
              </Typography>
            </>
          }
        />
      </Box>

      <Paper sx={{ height: 683, width: '100%', borderRadius: 4 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          filterMode="client"
          hideFooter={true}
          sx={{
            '.MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
            // Remove cell focus highlight
            '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            // Remove row selection highlight
            '.MuiDataGrid-row.Mui-selected': {
              backgroundColor: 'transparent',
            },
            '.MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '.month-cell': {
              fontWeight: 600,
            },
            // Apply background to ALL cells in column
            ...Object.fromEntries(
              data.datasets.map((ds: any) => [
                `& .MuiDataGrid-cell.category-${ds.categoryId}`,
                {
                  backgroundColor: hexToRgba(
                    categoryColorMap[ds.categoryId],
                    0.4,
                  ),
                },
              ]),
            ),

            // Color header
            ...Object.fromEntries(
              data.datasets.map((ds: any) => [
                `& .MuiDataGrid-columnHeader[data-field="${ds.categoryName}"]`,
                {
                  backgroundColor: hexToRgba(
                    categoryColorMap[ds.categoryId],
                    0.4,
                  ),
                },
              ]),
            ),
          }}
        />
      </Paper>
    </Box>
  );
}
