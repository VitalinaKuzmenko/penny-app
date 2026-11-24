/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import {
  Paper,
  Chip,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Stack,
} from '@mui/material';
import { CsvImportResponse, Category } from 'schemas';
import CategoryCellSelect from '@/components/CategoryCellSelect/CategoryCellSelect';
import TagCell from '@/components/TagCell/TagCell';
import { TagValue } from '@/utils/tags';

interface TransactionsTableProps {
  pageText: Record<string, any>;
  rows: CsvImportResponse[];
  categories: Category[];
  tagOptions: TagValue[];
  rowTags: Record<string, TagValue[]>;
  onChangeTags: (rowId: string, tags: TagValue[]) => void;
  selectedRows: string[];
  onSelectRows: React.Dispatch<React.SetStateAction<string[]>>;
  rowCategories: Record<string, string>;
  onChangeCategory: (rowId: string, categoryId: string) => void;
  rowDescriptions: Record<string, string>;
  onChangeDescription: (rowId: string, value: string) => void;
  forceImportRows: Record<string, boolean>;
  onToggleForceImport: (rowId: string, value: boolean) => void;
}

export default function TransactionsTable({
  pageText,
  rows,
  categories,
  tagOptions,
  rowTags,
  onChangeTags,
  selectedRows,
  onSelectRows,
  rowCategories,
  onChangeCategory,
  rowDescriptions,
  onChangeDescription,
  forceImportRows,
  onToggleForceImport,
}: TransactionsTableProps) {
  const hasDuplicates = React.useMemo(
    () => rows.some((r) => r.duplicate),
    [rows],
  );

  const columns = React.useMemo<GridColDef<CsvImportResponse>[]>(
    () => [
      ...(hasDuplicates
        ? ([
            {
              field: 'duplicate',
              headerName: '',
              width: 200,
              sortable: true,
              filterable: false,
              renderCell: (params) => {
                if (!params.row.duplicate) return null;
                const match = params.row.duplicateOf;
                // the user deleted the matching transaction in the Money Journal
                const wasDeleted = Boolean(match?.deleted);
                const tooltip = match
                  ? String(
                      wasDeleted
                        ? pageText.DUPLICATE_DELETED_TOOLTIP
                        : pageText.DUPLICATE_TOOLTIP,
                    )
                      .replace('{date}', match.date)
                      .replace('{amount}', String(match.amount))
                      .replace('{description}', match.description)
                  : '';
                return (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ height: '100%' }}
                  >
                    <Tooltip title={tooltip} arrow>
                      <Chip
                        label={
                          wasDeleted
                            ? pageText.DUPLICATE_DELETED_CHIP
                            : pageText.DUPLICATE_CHIP
                        }
                        size="small"
                        color={wasDeleted ? 'default' : 'warning'}
                        variant="outlined"
                      />
                    </Tooltip>
                    <FormControlLabel
                      sx={{
                        m: 0,
                        '.MuiFormControlLabel-label': { fontSize: 12 },
                      }}
                      control={
                        <Checkbox
                          size="small"
                          checked={Boolean(forceImportRows[params.row.id])}
                          onChange={(e) =>
                            onToggleForceImport(params.row.id, e.target.checked)
                          }
                        />
                      }
                      label={pageText.IMPORT_ANYWAY}
                    />
                  </Stack>
                );
              },
            },
          ] as GridColDef<CsvImportResponse>[])
        : []),
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
        renderCell: (params) => (
          <CategoryCellSelect
            // Positive rows: plain income, an internal transfer, or a refund for a spending category
            isMoneyIn={Number(params.row.amount) > 0}
            value={rowCategories[params.row.id] ?? ''}
            onChange={(categoryId) =>
              onChangeCategory(params.row.id, categoryId)
            }
            categories={categories}
            pageText={pageText}
            isAutoAssigned={
              params.row.autoAssigned &&
              rowCategories[params.row.id] === params.row.suggestedCategoryId
            }
          />
        ),
      },
      {
        field: 'tags',
        headerName: `${pageText.COLUMNS.TAGS}`,
        width: 260,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <TagCell
            tags={rowTags[params.row.id] ?? []}
            options={tagOptions}
            onChange={(tags) => onChangeTags(params.row.id, tags)}
            text={pageText.TAGS}
          />
        ),
      },
    ],
    [
      categories,
      tagOptions,
      rowTags,
      onChangeTags,
      onChangeCategory,
      rowCategories,
      rowDescriptions,
      onChangeDescription,
      pageText,
      hasDuplicates,
      forceImportRows,
      onToggleForceImport,
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
        getRowClassName={(params) =>
          params.row.duplicate && !forceImportRows[params.row.id]
            ? 'penny-row-skipped'
            : ''
        }
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
          // Skipped duplicates read as "won't be imported" without hiding them
          '.penny-row-skipped': {
            opacity: 0.55,
          },
          '.penny-row-skipped .MuiDataGrid-cell[data-field="description"], .penny-row-skipped .MuiDataGrid-cell[data-field="amount"], .penny-row-skipped .MuiDataGrid-cell[data-field="date"]':
            {
              textDecoration: 'line-through',
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
