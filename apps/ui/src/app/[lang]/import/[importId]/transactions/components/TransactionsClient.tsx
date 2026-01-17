/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Typography, Stack, Container } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import z from 'zod';
import TransactionsTable from './TransactionsTable';
import BulkCategoryBar from './BulkCategoryBar';
import {
  Account,
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

interface TransactionsClientProps {
  transactionsPageText: Record<string, any>;
  importId: string;
  rows: CsvImportResponse[];
  accounts: Account[];
  categories: Category[];
  currencies: GetCurrenciesResponse;
  serverErrors: UiError[] | null;
}

export type Currency = z.infer<typeof CurrencySchema>;

export default function TransactionsClient({
  transactionsPageText,
  importId,
  rows,
  accounts,
  categories,
  currencies,
  serverErrors,
}: TransactionsClientProps) {
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [rowCategories, setRowCategories] = useState<Record<string, string>>(
    {},
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [apiError, setApiError] = useState<UiError | null>(null);
  const [accountsState, setAccountsState] = useState<Account[]>(accounts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const router = useRouter();
  // const [areButtonsEnabled, setAreButtonsEnabled] = useState<boolean>(false);
  const areButtonsEnabled = useMemo(() => {
    const assignedCategoriesCount =
      Object.values(rowCategories).filter(Boolean).length;

    return Boolean(
      accountId && currency && rows.length === assignedCategoriesCount,
    );
  }, [accountId, currency, rowCategories, rows.length]);

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
        categoryId: rowCategories[row.id],
      }));

      const payload: ConfirmImportInput = {
        accountId,
        currency,
        rows: payloadRows,
      };

      ConfirmImportSchema.parse(payload);

      await saveTransactions(importId, payload);

      router.push('/');
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
        rows={rows}
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
          {transactionsPageText.FOOTER.SAVE_BUTTON}
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
