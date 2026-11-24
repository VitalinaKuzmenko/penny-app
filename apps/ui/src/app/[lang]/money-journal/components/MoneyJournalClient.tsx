/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import {
  Account,
  Category,
  ListTransactionsParams,
  ListTransactionsResponse,
  TransactionListItem,
  TransactionSortField,
  UpdateTransactionsSchema,
} from 'schemas';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import BulkCategoryBar from '@/components/BulkCategoryBar/BulkCategoryBar';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { UiError } from '@/types/interfaces';
import { getTransactions } from '@/requests/getTransactions';
import { updateTransactions } from '@/requests/updateTransactions';
import { interpolate } from '@/utils/interpolate';
import { mapUpdateTransactionsErrorToUiError } from '@/utils/mapUpdateTransactionsErrorToUiError';
import {
  MoneyJournalFilters as Filters,
  UNCATEGORISED_ID,
  useMoneyJournalFilters,
} from '@/providers/MoneyJournalFilterContext';
import MoneyJournalFilters from './MoneyJournalFilters';
import MoneyJournalTable from './MoneyJournalTable';
import TotalsBar from './TotalsBar';
import DiscardChangesDialog from './DiscardChangesDialog';
import {
  normaliseChange,
  PendingChange,
  PendingChanges,
} from './pendingChanges';

interface MoneyJournalClientProps {
  accounts: Account[];
  categories: Category[];
  serverErrors: UiError[] | null;
  pageText: Record<string, any>;
}

const DEFAULT_SORT: GridSortModel = [{ field: 'date', sort: 'desc' }];

// "Everything selected" and "nothing selected" both mean no filter, as on the dashboard
const toRequestParams = (
  filters: Filters,
  categories: Category[],
  accounts: Account[],
  pagination: GridPaginationModel,
  sort: GridSortModel,
): ListTransactionsParams => {
  const categoryIds = filters.categoryIds.filter(
    (id) => id !== UNCATEGORISED_ID,
  );
  const includeUncategorised = filters.categoryIds.includes(UNCATEGORISED_ID);
  const allCategories =
    filters.categoryIds.length === 0 ||
    (includeUncategorised && categoryIds.length === categories.length);
  const allAccounts =
    filters.accountIds.length === 0 ||
    filters.accountIds.length === accounts.length;
  const [sortBy] = sort.length ? sort : DEFAULT_SORT;

  return {
    from: filters.startDate?.format('YYYY-MM-DD'),
    to: filters.endDate?.format('YYYY-MM-DD'),
    ...(!allCategories && { categoryIds, includeUncategorised }),
    ...(!allAccounts && { accountIds: filters.accountIds }),
    type: filters.type === 'ALL' ? undefined : filters.type,
    search: filters.search.trim() || undefined,
    includeDeleted: filters.showDeleted,
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortField: sortBy.field as TransactionSortField,
    sortOrder: sortBy.sort ?? 'desc',
  };
};

export default function MoneyJournalClient({
  accounts,
  categories,
  serverErrors,
  pageText,
}: MoneyJournalClientProps) {
  const { appliedFilters, applyFilters, isInitialized, initFilters } =
    useMoneyJournalFilters();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT);
  const [data, setData] = useState<ListTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<UiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [pending, setPending] = useState<PendingChanges>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<UiError | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  // an action (paging, sorting, Apply) waiting for "discard unsaved changes?"
  const [blockedAction, setBlockedAction] = useState<(() => void) | null>(null);

  const changeCount = Object.keys(pending).length;
  const hasInvalidDescription = Object.values(pending).some(
    (c) => c.description !== undefined && c.description.trim() === '',
  );

  useEffect(() => {
    if (!isInitialized) {
      initFilters({
        categoryIds: [...categories.map((c) => c.id), UNCATEGORISED_ID],
        accountIds: accounts.map((a) => a.id),
      });
    }
  }, [accounts, categories, isInitialized, initFilters]);

  const requestParams = useMemo(
    () =>
      toRequestParams(
        appliedFilters,
        categories,
        accounts,
        paginationModel,
        sortModel,
      ),
    [appliedFilters, categories, accounts, paginationModel, sortModel],
  );

  useEffect(() => {
    if (!isInitialized) return;
    let cancelled = false;

    setLoading(true);
    setLoadError(null);
    getTransactions(requestParams)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setSelectedRows([]);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError({
          severity: 'error',
          title: pageText.ERRORS.LOAD.TITLE,
          message: pageText.ERRORS.LOAD.MESSAGE,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestParams, isInitialized, reloadKey, pageText]);

  // After deleting the last rows of the last page, step back to a page that has rows
  useEffect(() => {
    if (!data || data.rows.length || !data.rowCount) return;
    const lastPage = Math.ceil(data.rowCount / paginationModel.pageSize) - 1;
    if (paginationModel.page > lastPage) {
      setPaginationModel((p) => ({ ...p, page: lastPage }));
    }
  }, [data, paginationModel]);

  useEffect(() => {
    if (!changeCount) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [changeCount]);

  const guard = (action: () => void) => {
    if (changeCount) {
      setBlockedAction(() => action);
    } else {
      action();
    }
  };

  const discardChanges = () => {
    setPending({});
    setSaveError(null);
  };

  const handleChange = useCallback(
    (row: TransactionListItem, change: PendingChange) => {
      setPending((prev) => {
        const normalised = normaliseChange(row, { ...prev[row.id], ...change });
        const next = { ...prev };
        if (normalised) {
          next[row.id] = normalised;
        } else {
          delete next[row.id];
        }
        return next;
      });
    },
    [],
  );

  const applyToSelection = (change: PendingChange) => {
    const rows = data?.rows ?? [];
    selectedRows.forEach((id) => {
      const row = rows.find((r) => r.id === id);
      if (row) handleChange(row, change);
    });
    setSelectedRows([]);
  };

  const handleSave = async () => {
    const payload = {
      changes: Object.entries(pending).map(([id, change]) => ({
        id,
        ...change,
        ...(change.description !== undefined && {
          description: change.description.trim(),
        }),
      })),
    };

    setIsSaving(true);
    setSaveError(null);
    try {
      UpdateTransactionsSchema.parse(payload);
      const result = await updateTransactions(payload);
      setPending({});
      setSavedCount(result.updated);
      setReloadKey((k) => k + 1);
    } catch (error: any) {
      console.error('Saving transactions failed:', error?.data ?? error);
      setSaveError(
        mapUpdateTransactionsErrorToUiError(error?.data, pageText.ERRORS),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {pageText.TITLE}
        </Typography>
        <Typography color="text.secondary" mb={3}>
          {pageText.SUBTITLE}
        </Typography>
      </Box>

      {serverErrors?.map((error) => (
        <ErrorBanner key={error.message} error={error} />
      ))}

      <MoneyJournalFilters
        accounts={accounts}
        categories={categories}
        pageText={pageText}
        onApply={() =>
          guard(() => {
            applyFilters();
            setPaginationModel((p) => ({ ...p, page: 0 }));
          })
        }
      />

      <TotalsBar totals={data?.totals ?? null} pageText={pageText} />

      <BulkCategoryBar
        pageText={pageText.BULK_CATEGORY_BAR}
        categories={categories}
        selectedRows={selectedRows}
        onApply={(categoryId) => applyToSelection({ categoryId })}
        actions={
          <CustomButton
            variantType="secondary"
            color="error"
            onClick={() => applyToSelection({ deleted: true })}
            sx={{ minWidth: 180 }}
          >
            {pageText.BULK_CATEGORY_BAR.DELETE_BUTTON}
          </CustomButton>
        }
      />

      {loadError && (
        <Box mb={2}>
          <ErrorBanner error={loadError} />
        </Box>
      )}

      <MoneyJournalTable
        pageText={pageText}
        rows={data?.rows ?? []}
        rowCount={data?.rowCount ?? 0}
        loading={loading || !isInitialized}
        categories={categories}
        pending={pending}
        onChange={handleChange}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) =>
          guard(() => setPaginationModel(model))
        }
        sortModel={sortModel}
        onSortModelChange={(model) =>
          guard(() => {
            setSortModel(model.length ? model : DEFAULT_SORT);
            setPaginationModel((p) => ({ ...p, page: 0 }));
          })
        }
        selectedRows={selectedRows}
        onSelectRows={setSelectedRows}
      />

      {saveError && (
        <Box mt={2}>
          <ErrorBanner error={saveError} />
        </Box>
      )}

      {changeCount > 0 && (
        <Paper
          elevation={6}
          sx={{
            position: 'sticky',
            bottom: 16,
            mt: 2,
            p: 2,
            borderRadius: 4,
            zIndex: 10,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={500}>
              {interpolate(pageText.SAVE_BAR.UNSAVED, { count: changeCount })}
            </Typography>
            <Stack direction="row" spacing={2}>
              <CustomButton
                variantType="text"
                onClick={discardChanges}
                disabled={isSaving}
              >
                {pageText.SAVE_BAR.DISCARD}
              </CustomButton>
              <CustomButton
                variantType="primary"
                onClick={handleSave}
                loading={isSaving}
                disabled={hasInvalidDescription}
              >
                {pageText.SAVE_BAR.SAVE}
              </CustomButton>
            </Stack>
          </Stack>
        </Paper>
      )}

      <DiscardChangesDialog
        open={blockedAction !== null}
        count={changeCount}
        pageText={pageText}
        onCancel={() => setBlockedAction(null)}
        onConfirm={() => {
          const action = blockedAction;
          setBlockedAction(null);
          discardChanges();
          action?.();
        }}
      />

      <Snackbar
        open={savedCount !== null}
        autoHideDuration={3000}
        onClose={() => setSavedCount(null)}
        message={interpolate(pageText.SAVE_BAR.SAVED, {
          count: savedCount ?? 0,
        })}
      />
    </Box>
  );
}
