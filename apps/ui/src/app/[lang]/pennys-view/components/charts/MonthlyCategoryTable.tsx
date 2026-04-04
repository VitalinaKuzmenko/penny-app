/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridValueFormatter,
} from '@mui/x-data-grid';
import { useDashboardFilters } from '@/providers/FilterContext';
import { getMonthlyCategory } from '@/requests/charts/getMonthlyCategory';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { formatCurrency } from '@/utils/formatCurrency';
import { UiError } from '@/types/interfaces';
import { ApiError } from '@/utils/clientApiFetch';
import { MonthlyCategoryResponse } from 'schemas';

export default function MonthlyCategoryTable() {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryCols: GridColDef[] = data.datasets.map((ds: any) => ({
    field: ds.categoryName,
    headerName: ds.categoryName,
    width: 120,
    valueFormatter: ((value, row) =>
      formatCurrency(value ?? 0)) as GridValueFormatter,
    cellClassName: (params: GridCellParams) => {
      const value = params.value;
      if (typeof value === 'number' && value > 1000) {
        return 'high-spending';
      }
      return '';
    },
  }));

  const columns: GridColDef[] = [
    { field: 'month', headerName: 'Month', width: 100 },
    ...categoryCols,
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      valueFormatter: (value) =>
        formatCurrency(typeof value === 'number' ? value : 0),
      cellClassName: (params) => (params.value > 5000 ? 'high-total' : ''),
    },
  ];

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Monthly Spending by Category ({year})
      </Typography>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 12, page: 0 },
            },
          }}
          pageSizeOptions={[12]}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
          }
        />
      </Box>

      <style jsx>{`
        .high-spending {
          background-color: rgba(244, 67, 54, 0.2); // light red
        }
        .high-total {
          background-color: rgba(33, 150, 243, 0.2); // light blue
        }
        .even-row {
          background-color: #f9f9f9;
        }
        .odd-row {
          background-color: #fff;
        }
      `}</style>
    </Box>
  );
}
