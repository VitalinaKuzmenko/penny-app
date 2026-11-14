/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Typography, Stack, Container } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import z from 'zod';
import TransactionsTable from './TransactionsTable';
import BulkCategoryBar from './BulkCategoryBar';
import DuplicatesBar from './DuplicatesBar';
import {
  AccountWithActivity,
  Category,
  CsvImportResponse,
  CurrencySchema,
  GetCurrenciesResponse,
} from 'schemas';
import AccountSelect from './AccountSelect';
import CurrencySelect from './CurrencySelect';
import { UiError } from '@/types/interfaces';

import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { ConfirmImportSchema, ConfirmImportInput } from 'schemas';
import { saveTransactions } from '@/requests/saveTransactions';
import { mapConfirmImportErrorToUiError } from '@/utils/mapConfirmImportErrorToUiError';
import CreateAccountModal from './CreateAccountModal';
import { getAccounts } from '@/requests/getAccounts';
import { getImportRows } from '@/requests/getImportRows';

interface TransactionsClientProps {
  transactionsPageText: Record<string, any>;
  importId: string;
  rows: CsvImportResponse[];
  accounts: AccountWithActivity[];
  categories: Category[];
  currencies: GetCurrenciesResponse;
  serverErrors: UiError[] | null;
}

export type Currency = z.infer<typeof CurrencySchema>;

export default function TransactionsClient({
  transactionsPageText,
  importId,
  rows: initialRows,
  accounts,
  categories,
  currencies,
  serverErrors,
}: TransactionsClientProps) {
  // Rows are re-fetched once an account is chosen so duplicate flags can be computed per account
  const [rows, setRows] = useState<CsvImportResponse[]>(initialRows);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [rowCategories, setRowCategories] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialRows
          .filter((r) => r.suggestedCategoryId)
          .map((r) => [r.id, r.suggestedCategoryId as string]),
      ),
  );
  const [rowDescriptions, setRowDescriptions] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(initialRows.map((r) => [r.id, r.description ?? ''])),
  );
  // Duplicates are skipped unless the user explicitly opts a row back in
  const [forceImportRows, setForceImportRows] = useState<
    Record<string, boolean>
  >({});

  // Unassigned rows first so users see what still needs attention
  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => Number(a.autoAssigned) - Number(b.autoAssigned)),
    [rows],
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [apiError, setApiError] = useState<UiError | null>(null);
  const [accountsState, setAccountsState] =
    useState<AccountWithActivity[]>(accounts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const router = useRouter();

  const duplicateRows = useMemo(() => rows.filter((r) => r.duplicate), [rows]);

  const isRowSkipped = useCallback(
    (row: CsvImportResponse) => row.duplicate && !forceImportRows[row.id],
    [forceImportRows],
  );

  const rowsToImport = useMemo(
    () => rows.filter((r) => !isRowSkipped(r)),
    [rows, isRowSkipped],
  );
  const skippedCount = rows.length - rowsToImport.length;

  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    getImportRows(importId, accountId)
      .then((fresh) => {
        if (cancelled) return;
        setRows(fresh);
        setForceImportRows({});
      })
      .catch((err) => console.error('Failed to refresh import rows', err));
    return () => {
      cancelled = true;
    };
  }, [accountId, importId]);

  const areButtonsEnabled = useMemo(() => {
    // Skipped duplicates don't need a category since they won't be saved
    const rowsToCheck = rowsToImport.filter((row) => Number(row.amount) <= 0);
    const assignedCategoriesCount = rowsToCheck.filter((row) =>
      Boolean(rowCategories[row.id]),
    ).length;

    return Boolean(
      accountId &&
      currency &&
      rowsToImport.length > 0 &&
      rowsToCheck.length === assignedCategoriesCount,
    );
  }, [accountId, currency, rowCategories, rowsToImport]);

  const refetchAccounts = async () => {
    const freshAccounts = await getAccounts();

    setAccountsState(freshAccounts);
  };

  const goToHomePage = () => {
    router.push('/');
  };

  const handleTransactionSave = async () => {
    if (!accountId || !currency) return;
    setIsSaving(true);
    setApiError(null); // clear previous error

    try {
      const payloadRows: ConfirmImportInput['rows'] = rows.map((row) => ({
        id: row.id,
        categoryId: rowCategories[row.id] || undefined,
        description: rowDescriptions[row.id],
        forceImport: row.duplicate
          ? Boolean(forceImportRows[row.id])
          : undefined,
      }));

      const payload: ConfirmImportInput = {
        accountId,
        currency,
        rows: payloadRows,
      };

      ConfirmImportSchema.parse(payload);

      await saveTransactions(importId, payload);

      router.push('/pennys-view');
    } catch (error: any) {
      console.error('Confirm import failed:', error.data);

      const uiError = mapConfirmImportErrorToUiError(
        error.data,
        transactionsPageText.ERRORS,
      );

      setApiError(uiError);
    } finally {
      setIsSaving(false);
    }
  };

  //display alert fo user before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return ''; // Required for some other browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Container sx={{ p: { xs: 1, md: 3 } }} maxWidth="xl" disableGutters>
      {/* Title */}
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {transactionsPageText.TITLE}
        </Typography>
        <Typography color="text.secondary" mb={3}>
          {transactionsPageText.SUBTITLE}
        </Typography>
      </Box>

      {/* Error display */}
      {serverErrors &&
        serverErrors.length > 0 &&
        serverErrors.map((error) => (
          <ErrorBanner key={error.message} error={error} />
        ))}

      {/* Inputs */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        mb={2}
        alignItems="stretch"
      >
        {/* Currency select */}
        <CurrencySelect
          pageText={transactionsPageText.CURRENCY_SELECT}
          currencies={currencies}
          value={currency}
          onChange={setCurrency}
        />

        {/* Account select + create */}
        <AccountSelect
          pageText={transactionsPageText.ACCOUNT_SELECT}
          accounts={accountsState}
          value={accountId}
          onChange={setAccountId}
          onCreate={() => setIsCreateModalOpen(true)}
        />
      </Stack>

      {/* Duplicates summary */}
      <DuplicatesBar
        pageText={transactionsPageText.DUPLICATES_BAR}
        duplicateCount={duplicateRows.length}
        onSkipAll={() => setForceImportRows({})}
        onImportAll={() =>
          setForceImportRows(
            Object.fromEntries(duplicateRows.map((r) => [r.id, true])),
          )
        }
      />

      {/* Bulk category */}
      <BulkCategoryBar
        pageText={transactionsPageText.BULK_CATEGORY_BAR}
        categories={categories}
        selectedRows={selectedRows}
        onApply={(categoryId: string) => {
          setRowCategories((prev) => {
            const next = { ...prev };
            selectedRows.forEach((id) => (next[id] = categoryId));
            return next;
          });

          setSelectedRows([]);
        }}
      />

      {/* Table */}
      <TransactionsTable
        pageText={transactionsPageText.TABLE}
        rows={sortedRows}
        categories={categories}
        selectedRows={selectedRows}
        onSelectRows={setSelectedRows}
        rowCategories={rowCategories}
        onChangeCategory={(rowId: string, categoryId: string) =>
          setRowCategories((prev) => ({
            ...prev,
            [rowId]: categoryId,
          }))
        }
        rowDescriptions={rowDescriptions}
        onChangeDescription={(rowId: string, value: string) =>
          setRowDescriptions((prev) => ({
            ...prev,
            [rowId]: value,
          }))
        }
        forceImportRows={forceImportRows}
        onToggleForceImport={(rowId: string, value: boolean) =>
          setForceImportRows((prev) => ({ ...prev, [rowId]: value }))
        }
      />
      {apiError && (
        <Box sx={{ mt: 3 }}>
          <ErrorBanner error={apiError} />
        </Box>
      )}

      {/* Footer */}
      <Stack direction="row" justifyContent="space-between" mt={3}>
        <CustomButton
          variantType="text"
          onClick={goToHomePage}
          disabledStyling={isSaving}
        >
          {transactionsPageText.FOOTER.BACK_TO_HOME_PAGE}
        </CustomButton>

        <CustomButton
          variantType="primary"
          disabledStyling={!areButtonsEnabled || isSaving}
          onClick={handleTransactionSave}
        >
          {duplicateRows.length
            ? `${String(
                transactionsPageText.FOOTER.SAVE_BUTTON_WITH_COUNT,
              ).replace('{count}', String(rowsToImport.length))}${
                skippedCount
                  ? ` ${String(
                      transactionsPageText.FOOTER.SKIPPED_SUFFIX,
                    ).replace('{skipped}', String(skippedCount))}`
                  : ''
              }`
            : transactionsPageText.FOOTER.SAVE_BUTTON}
        </CustomButton>
      </Stack>

      {/* Pop up for create account */}
      <CreateAccountModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refetchAccounts}
        pageText={transactionsPageText.CREATE_ACCOUNT_MODAL}
      />
    </Container>
  );
}
