/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { Paper, FormControl, Select, MenuItem, Chip } from '@mui/material';
import { CsvImportResponse, Category } from 'schemas';

interface TransactionsTableProps {
  pageText: Record<string, any>;
  rows: CsvImportResponse[];
  categories: Category[];
  selectedRows: string[];
  onSelectRows: React.Dispatch<React.SetStateAction<string[]>>;
  rowCategories: Record<string, string>;
  onChangeCategory: (rowId: string, categoryId: string) => void;
  rowDescriptions: Record<string, string>;
  onChangeDescription: (rowId: string, value: string) => void;
}

export default function TransactionsTable({
  pageText,
  rows,
  categories,
  selectedRows,
  onSelectRows,
  rowCategories,
  onChangeCategory,
  rowDescriptions,
  onChangeDescription,
}: TransactionsTableProps) {
  const columns = React.useMemo<GridColDef<CsvImportResponse>[]>(
    () => [
      {
        field: 'date',
        headerName: `${pageText.COLUMNS.DATE}`,
        minWidth: 150,
        flex: 1,
        filterable: true,
      },
      {
        field: 'description',
        headerName: `${pageText.COLUMNS.DESCRIPTION}`,
        minWidth: 150,
        flex: 2,
        filterable: true,
        renderCell: (params) => {
          const value = rowDescriptions[params.row.id] ?? '';

          return (
            <input
              value={value}
              onChange={(e) =>
                onChangeDescription(params.row.id, e.target.value)
              }
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
              }}
            />
          );
        },
      },
      {
        field: 'amount',
        headerName: `${pageText.COLUMNS.AMOUNT}`,
        minWidth: 100,
        flex: 1,
        filterable: true,
      },
      {
        field: 'category',
        headerName: `${pageText.COLUMNS.CATEGORY}`,
        width: 300,
        sortable: false,
        filterable: true,
        valueGetter: (value, row) => {
          const rowId = row.id;
          const categoryId = rowCategories[rowId];
          return categories.find((c) => c.id === categoryId)?.name ?? '';
        },
        renderCell: (params) => {
          const amount = Number(params.row.amount);
          const isAutoAssigned =
            params.row.autoAssigned &&
            rowCategories[params.row.id] === params.row.suggestedCategoryId;

          const selectEl = (options: React.ReactNode) => (
            <FormControl
              size="small"
              fullWidth
              sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
            >
              <Select
                value={rowCategories[params.row.id] ?? ''}
                onChange={(e) =>
                  onChangeCategory(params.row.id, e.target.value)
                }
                sx={{ width: '100%' }}
                startAdornment={
                  isAutoAssigned ? (
                    <Chip
                      label="auto"
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ mr: 0.5, height: 18, fontSize: 10 }}
                    />
                  ) : undefined
                }
              >
                {options}
              </Select>
            </FormControl>
          );
          // Early exit: hide selector for positive amounts without internal transfer
          if (amount > 0) {
            const internalTransferCategory = categories.find(
              (cat) => cat.name === 'Internal Transfer',
            );
            if (!internalTransferCategory) return null;

            // MUI Select needs MenuItems as direct children — no Fragment wrapper
            return selectEl([
              <MenuItem
                key={internalTransferCategory.id}
                value={internalTransferCategory.id}
              >
                {internalTransferCategory.name}
              </MenuItem>,
              <MenuItem key="none" value="">
                {pageText.CUSTOM_CATEGORY_CELL_NAME}
              </MenuItem>,
            ]);
          }

          // Options for normal rows
          return selectEl(
            categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            )),
          );
        },
      },
    ],
    [
      categories,
      onChangeCategory,
      rowCategories,
      rowDescriptions,
      onChangeDescription,
      pageText,
    ],
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
