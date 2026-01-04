'use client';

import { Box, Button, Typography, Stack, Container } from '@mui/material';
import { useState } from 'react';
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
import z from 'zod';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';

interface TransactionsClientProps {
  rows: CsvImportResponse[];
  accounts: Account[];
  categories: Category[];
  currencies: GetCurrenciesResponse;
  serverError: UiError | null;
}

export type Currency = z.infer<typeof CurrencySchema>;

export default function TransactionsClient({
  rows,
  accounts,
  categories,
  currencies,
  serverError,
}: TransactionsClientProps) {
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [rowCategories, setRowCategories] = useState<Record<string, string>>(
    {},
  );

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

      <ErrorBanner error={serverError} />

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
        <Button color="inherit">Cancel</Button>

        <Button variant="contained" disabled={!currency || !accountId}>
          Save & continue
        </Button>
      </Stack>
    </Container>
  );
}
