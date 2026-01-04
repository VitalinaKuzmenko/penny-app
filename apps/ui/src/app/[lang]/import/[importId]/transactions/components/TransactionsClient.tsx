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

interface TransactionsClientProps {
  rows: CsvImportResponse[];
  accounts: Account[];
  categories: Category[];
  currencies: GetCurrenciesResponse;
  serverErrors: UiError[] | null;
}

export type Currency = z.infer<typeof CurrencySchema>;

export default function TransactionsClient({
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

  const handleTransactionSave = () => {
    console.log('handleTransactionSave');
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

      {/* Footer */}
      <Stack direction="row" justifyContent="space-between" mt={4}>
        <CustomButton variantType="text" onClick={goToHomePage}>
          Cancel
        </CustomButton>

        <CustomButton
          variantType="primary"
          disabledStyling={!areButtonsEnabled}
          onClick={handleTransactionSave}
        >
          Save & continue
        </CustomButton>
      </Stack>
    </Container>
  );
}
