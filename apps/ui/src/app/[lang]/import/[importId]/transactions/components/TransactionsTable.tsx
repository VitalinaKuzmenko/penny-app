/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { Paper, FormControl, Select, MenuItem } from '@mui/material';
import { CsvImportResponse, Category } from 'schemas';

interface TransactionsTableProps {
  pageText: Record<string, any>;
  rows: CsvImportResponse[];
  categories: Category[];
  selectedRows: string[];
  onSelectRows: React.Dispatch<React.SetStateAction<string[]>>;
  rowCategories: Record<string, string>;
  onChangeCategory: (rowId: string, categoryId: string) => void;
}

export default function TransactionsTable({
  pageText,
  rows,
  categories,
  selectedRows,
  onSelectRows,
  rowCategories,
  onChangeCategory,
}: TransactionsTableProps) {
  const columns = React.useMemo<GridColDef<CsvImportResponse>[]>(
    () => [
      {
        field: 'date',
        headerName: `${pageText.DATE}`,
        minWidth: 150,
        flex: 1,
        filterable: true,
      },
      {
        field: 'description',
        headerName: `${pageText.DESCRIPTION}`,
        minWidth: 150,
        flex: 2,
        filterable: true,
      },
      {
        field: 'amount',
        headerName: `${pageText.AMOUNT}`,
        minWidth: 100,
        flex: 1,
        filterable: true,
      },
      {
        field: 'category',
        headerName: `${pageText.CATEGORY}`,
        width: 300,
        sortable: false,
        filterable: true,
        valueGetter: (value, row) => {
          const rowId = row.id;
          const categoryId = rowCategories[rowId];
          return categories.find((c) => c.id === categoryId)?.name ?? '';
        },
        renderCell: (params) => (
          <FormControl
            size="small"
            fullWidth
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center', // vertically center
            }}
          >
            <Select
              value={rowCategories[params.row.id] ?? ''}
              onChange={(e) => onChangeCategory(params.row.id, e.target.value)}
              sx={{
                width: '100%',
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },
    ],
    [categories, onChangeCategory, rowCategories],
  );

  return (
    <Paper sx={{ height: 600, width: '100%', borderRadius: 4 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={{
          type: 'include',
          ids: new Set<GridRowId>(selectedRows),
        }}
        onRowSelectionModelChange={(newSelection) =>
          onSelectRows(Array.from(newSelection.ids).map(String))
        }
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
        }}
      />
    </Paper>
  );
}
