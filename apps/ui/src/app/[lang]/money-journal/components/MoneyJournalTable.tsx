/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowId,
  GridSortModel,
} from '@mui/x-data-grid';
import { Chip, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Category,
  TransactionListItem,
  TRANSACTIONS_PAGE_SIZES,
} from 'schemas';
import CategoryCellSelect from '@/components/CategoryCellSelect/CategoryCellSelect';
import TagCell from '@/components/TagCell/TagCell';
import { formatMoney } from '@/utils/formatMoney';
import { TagValue } from '@/utils/tags';
import { effectiveRow, PendingChange, PendingChanges } from './pendingChanges';

interface MoneyJournalTableProps {
  pageText: Record<string, any>;
  rows: TransactionListItem[];
  rowCount: number;
  loading: boolean;
  categories: Category[];
  // saved tags plus new names already used in unsaved edits
  tagOptions: TagValue[];
  pending: PendingChanges;
  onChange: (row: TransactionListItem, change: PendingChange) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  selectedRows: string[];
  onSelectRows: (ids: string[]) => void;
}

// ISO date → DD/MM/YYYY without timezone shifts (dates are stored as UTC days)
const formatDay = (iso: string) =>
  iso.slice(0, 10).split('-').reverse().join('/');

export default function MoneyJournalTable({
  pageText,
  rows,
  rowCount,
  loading,
  categories,
  tagOptions,
  pending,
  onChange,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  selectedRows,
  onSelectRows,
}: MoneyJournalTableProps) {
  const text = pageText.TABLE;

  const columns = React.useMemo<GridColDef<TransactionListItem>[]>(
    () => [
      {
        field: 'date',
        headerName: text.COLUMNS.DATE,
        width: 110,
        sortable: true,
        valueFormatter: (value: string) => formatDay(value),
      },
      {
        field: 'description',
        headerName: text.COLUMNS.DESCRIPTION,
        minWidth: 200,
        flex: 2,
        sortable: false,
        renderCell: (params) => {
          const view = effectiveRow(
            params.row,
            pending[params.row.id],
            categories,
          );
          return (
            <Tooltip
              title={view.descriptionInvalid ? text.EMPTY_DESCRIPTION : ''}
              arrow
            >
              {/* span: tooltips need a non-disabled child */}
              <span style={{ width: '100%' }}>
                <input
                  value={view.description}
                  disabled={view.locked}
                  aria-invalid={view.descriptionInvalid}
                  onChange={(e) =>
                    onChange(params.row, { description: e.target.value })
                  }
                  // keep typing (e.g. space) from toggling grid selection
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    border: view.descriptionInvalid
                      ? '1px solid #d32f2f'
                      : 'none',
                    borderRadius: 4,
                    outline: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    font: 'inherit',
                  }}
                />
              </span>
            </Tooltip>
          );
        },
      },
      {
        field: 'amount',
        headerName: text.COLUMNS.AMOUNT,
        width: 130,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const isMoneyOut = params.row.type === 'EXPENSE';
          return (
            <span
              style={{
                color: isMoneyOut ? '#D94656' : '#047857',
                fontWeight: 600,
              }}
            >
              {formatMoney(
                isMoneyOut ? -params.row.amount : params.row.amount,
                params.row.currency,
                'always',
              )}
            </span>
          );
        },
      },
      {
        field: 'type',
        headerName: text.COLUMNS.TYPE,
        width: 110,
        sortable: false,
        renderCell: (params) => {
          const { type } = effectiveRow(
            params.row,
            pending[params.row.id],
            categories,
          );
          return (
            <Chip
              label={text.TYPES[type]}
              size="small"
              variant="outlined"
              color={
                type === 'EXPENSE'
                  ? 'default'
                  : type === 'REFUND'
                    ? 'success'
                    : 'primary'
              }
              sx={{
                fontWeight: 600,
                bgcolor: (t) =>
                  type === 'EXPENSE'
                    ? 'background.paper'
                    : alpha(
                        type === 'REFUND'
                          ? t.palette.success.main
                          : t.palette.primary.main,
                        0.08,
                      ),
              }}
            />
          );
        },
      },
      {
        field: 'category',
        headerName: text.COLUMNS.CATEGORY,
        width: 280,
        sortable: true,
        renderCell: (params) => {
          const view = effectiveRow(
            params.row,
            pending[params.row.id],
            categories,
          );
          return (
            <CategoryCellSelect
              isMoneyIn={params.row.type !== 'EXPENSE'}
              value={view.categoryId ?? ''}
              onChange={(categoryId) =>
                onChange(params.row, { categoryId: categoryId || null })
              }
              categories={categories}
              pageText={text}
              noneLabel={text.NONE_OPTION}
              displayEmpty
              disabled={view.locked}
            />
          );
        },
      },
      {
        field: 'tags',
        headerName: text.COLUMNS.TAGS,
        width: 260,
        sortable: false,
        renderCell: (params) => {
          const view = effectiveRow(
            params.row,
            pending[params.row.id],
            categories,
          );
          return (
            <TagCell
              tags={view.tags}
              options={tagOptions}
              onChange={(tags) => onChange(params.row, { tags })}
              disabled={view.locked}
              text={text.TAGS}
            />
          );
        },
      },
      {
        field: 'account',
        headerName: text.COLUMNS.ACCOUNT,
        minWidth: 120,
        flex: 1,
        sortable: true,
        valueGetter: (_value, row) => row.account.name,
      },
      {
        field: 'currency',
        headerName: text.COLUMNS.CURRENCY,
        width: 90,
        sortable: false,
      },
      {
        field: 'actions',
        headerName: text.COLUMNS.ACTIONS,
        width: 190,
        sortable: false,
        renderCell: (params) => {
          const { pendingDelete, pendingRestore } = effectiveRow(
            params.row,
            pending[params.row.id],
            categories,
          );
          const isDeleted = params.row.deleted;

          const chip = pendingDelete
            ? { label: text.PENDING_DELETE_CHIP, color: 'error' as const }
            : pendingRestore
              ? { label: text.PENDING_RESTORE_CHIP, color: 'success' as const }
              : isDeleted
                ? { label: text.DELETED_CHIP, color: 'default' as const }
                : null;

          const action = isDeleted
            ? pendingRestore
              ? { title: text.UNDO_RESTORE, icon: <UndoIcon />, deleted: true }
              : {
                  title: text.RESTORE,
                  icon: <RestoreFromTrashIcon />,
                  deleted: false,
                }
            : pendingDelete
              ? { title: text.UNDO_DELETE, icon: <UndoIcon />, deleted: false }
              : {
                  title: text.DELETE,
                  icon: <DeleteOutlineIcon />,
                  deleted: true,
                };

          return (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ height: '100%' }}
            >
              <Tooltip title={action.title} arrow>
                <IconButton
                  size="small"
                  aria-label={action.title}
                  sx={{
                    bgcolor: action.deleted ? '#FDEBEE' : '#F5EAFB',
                    color: action.deleted ? '#D94656' : 'secondary.main',
                    '&:hover': {
                      bgcolor: action.deleted ? '#FBDDE2' : '#EEDDF8',
                    },
                  }}
                  onClick={() =>
                    onChange(params.row, { deleted: action.deleted })
                  }
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
              {chip && (
                <Chip
                  label={chip.label}
                  size="small"
                  color={chip.color}
                  variant="outlined"
                />
              )}
            </Stack>
          );
        },
      },
    ],
    [text, pending, categories, tagOptions, onChange],
  );

  return (
    <Paper
      sx={{
        height: 700,
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        bgcolor: '#FFFBF9',
      }}
    >
      <DataGrid
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        columns={columns}
        getRowId={(row) => row.id}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[...TRANSACTIONS_PAGE_SIZES]}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        sortingOrder={['desc', 'asc']}
        disableColumnFilter
        checkboxSelection
        disableRowSelectionOnClick
        // deleted rows can only be restored, one at a time
        isRowSelectable={(params) => !params.row.deleted}
        rowSelectionModel={{
          type: 'include',
          ids: new Set<GridRowId>(selectedRows),
        }}
        onRowSelectionModelChange={(selection) =>
          onSelectRows(Array.from(selection.ids).map(String))
        }
        getRowClassName={(params) => {
          const view = effectiveRow(
            params.row,
            pending[params.row.id],
            categories,
          );
          if (view.pendingDelete) return 'mj-row-pending-delete';
          if (params.row.deleted && !view.pendingRestore)
            return 'mj-row-deleted';
          return pending[params.row.id] ? 'mj-row-edited' : '';
        }}
        localeText={{ noRowsLabel: text.NO_ROWS }}
        sx={{
          border: 'none',
          '--DataGrid-t-header-background-base': '#FBF3FA',
          '--DataGrid-t-color-border-base': 'rgba(83, 36, 70, 0.08)',
          '--DataGrid-t-color-background-base': '#FFFBF9',
          '.MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
            color: 'secondary.main',
          },
          '.MuiCheckbox-root.Mui-checked, .MuiCheckbox-root.MuiCheckbox-indeterminate':
            {
              color: 'secondary.main',
            },
          '.MuiDataGrid-row.Mui-selected, .MuiDataGrid-row.Mui-selected:hover':
            {
              bgcolor: '#F5EAFB',
            },
          '.MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(83, 36, 70, 0.08)',
          },
          '.mj-row-deleted': {
            opacity: 0.5,
          },
          '.mj-row-pending-delete': {
            opacity: 0.55,
            // light red so a row about to be deleted stands out before saving
            bgcolor: 'rgba(211, 47, 47, 0.12)',
            '&:hover': {
              bgcolor: 'rgba(211, 47, 47, 0.18)',
            },
          },
          '.mj-row-pending-delete .MuiDataGrid-cell[data-field="description"], .mj-row-pending-delete .MuiDataGrid-cell[data-field="amount"], .mj-row-pending-delete .MuiDataGrid-cell[data-field="date"]':
            {
              textDecoration: 'line-through',
            },
          '.mj-row-edited': {
            bgcolor: 'rgba(255, 193, 7, 0.08)',
          },
          '.MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '.MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      />
    </Paper>
  );
}
