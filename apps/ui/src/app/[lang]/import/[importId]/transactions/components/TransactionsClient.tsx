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
import { ApiError } from '@/utils/clientApiFetch';
import { mapConfirmImportErrorToUiError } from '@/utils/mapConfirmImportErrorToUiError';

interface TransactionsClientProps {
  importId: string;
  rows: CsvImportResponse[];
  accounts: Account[];
  categories: Category[];
  currencies: GetCurrenciesResponse;
  serverErrors: UiError[] | null;
}

export type Currency = z.infer<typeof CurrencySchema>;

export default function TransactionsClient({
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

  const router = useRouter();
  // const [areButtonsEnabled, setAreButtonsEnabled] = useState<boolean>(false);
  const areButtonsEnabled = useMemo(() => {
    const assignedCategoriesCount =
      Object.values(rowCategories).filter(Boolean).length;

    return Boolean(
      accountId && currency && rows.length === assignedCategoriesCount,
    );
  }, [accountId, currency, rowCategories, rows.length]);

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

      console.log('payload', payload);

      // Call API
      const response = await saveTransactions(importId, payload);

      console.log('response', response);

      // Navigate away on success
      router.push('/');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Confirm import failed:', error);

      // const uiError = mapConfirmImportErrorToUiError(error, errorsDict);
      // setApiError(uiError);
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
          Check your transactions
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Make sure everything looks correct before saving.
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
          currencies={currencies}
          value={currency}
          onChange={setCurrency}
        />

        {/* Account select + create */}
        <AccountSelect
          accounts={accounts}
          value={accountId}
          onChange={setAccountId}
        />
      </Stack>

      {/* Bulk category */}
      <BulkCategoryBar
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
      <Box sx={{ mt: 3 }}>{apiError && <ErrorBanner error={apiError} />}</Box>

      {/* Footer */}
      <Stack direction="row" justifyContent="space-between" mt={3}>
        <CustomButton
          variantType="text"
          onClick={goToHomePage}
          disabledStyling={isSaving}
        >
          Cancel
        </CustomButton>

        <CustomButton
          variantType="primary"
          disabledStyling={!areButtonsEnabled || isSaving}
          onClick={handleTransactionSave}
        >
          Save & continue
        </CustomButton>
      </Stack>
    </Container>
  );
}
