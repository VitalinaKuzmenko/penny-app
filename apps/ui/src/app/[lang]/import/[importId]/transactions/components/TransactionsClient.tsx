/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import Image from 'next/image';
import star from '../../../../../../../public/star_icon.png';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import z from 'zod';
import TransactionsTable from './TransactionsTable';
import BulkActionsPanel from '@/components/BulkActionsPanel/BulkActionsPanel';
import BulkCategoryBar from '@/components/BulkCategoryBar/BulkCategoryBar';
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
import BulkTagBar from '@/components/BulkTagBar/BulkTagBar';
import ImportStepper from '@/components/ImportStepper/ImportStepper';
import PageHero from '@/components/PageHero/PageHero';
import { ConfirmImportSchema, ConfirmImportInput } from 'schemas';
import { saveTransactions } from '@/requests/saveTransactions';
import { mapConfirmImportErrorToUiError } from '@/utils/mapConfirmImportErrorToUiError';
import CreateAccountModal from './CreateAccountModal';
import { getAccounts } from '@/requests/getAccounts';
import { getImportRows } from '@/requests/getImportRows';
import { useTags } from '@/hooks/useTags';
import {
  addTags,
  removeTags,
  TagValue,
  tagOptions as buildTagOptions,
  toTagRef,
} from '@/utils/tags';

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
  // Tags start empty; new names are created when the import is confirmed
  const [rowTags, setRowTags] = useState<Record<string, TagValue[]>>({});
  const { tags } = useTags();
  const tagOptions = useMemo(
    () => buildTagOptions(tags, Object.values(rowTags).flat()),
    [tags, rowTags],
  );
  const selectedRowTags = useMemo(
    () => selectedRows.flatMap((id) => rowTags[id] ?? []),
    [selectedRows, rowTags],
  );
  const updateSelectedTags = (update: (current: TagValue[]) => TagValue[]) => {
    setRowTags((prev) => {
      const next = { ...prev };
      selectedRows.forEach((id) => (next[id] = update(prev[id] ?? [])));
      return next;
    });
    setSelectedRows([]);
  };

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
        tags: rowTags[row.id]?.length
          ? rowTags[row.id].map(toTagRef)
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
    <Container maxWidth="xl" disableGutters>
      <PageHero
        title={transactionsPageText.TITLE}
        subtitle={transactionsPageText.SUBTITLE}
      />

      <Box sx={{ mt: { xs: 2, md: 4 }, mb: 3 }}>
        <ImportStepper labels={transactionsPageText.STEPPER} currentStep={2} />
      </Box>

      {/* Error display */}
      {serverErrors &&
        serverErrors.length > 0 &&
        serverErrors.map((error) => (
          <ErrorBanner key={error.message} error={error} />
        ))}

      {/* Import info: currency, account and "create account" share one card;
          they stack full-width on phones */}
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: '20px' }}>
        <Box
          display="grid"
          gap={2}
          gridTemplateColumns={{
            xs: 'minmax(0, 1fr)',
            // currency gets its own row so "create" always sits next to account
            sm: 'minmax(0, 1fr) auto',
            lg: 'minmax(0, 1fr) minmax(0, 2fr) auto',
          }}
          alignItems="end"
        >
          {/* Currency select */}
          <Box sx={{ gridColumn: { sm: '1 / -1', lg: 'auto' }, minWidth: 0 }}>
            <CurrencySelect
              pageText={transactionsPageText.CURRENCY_SELECT}
              currencies={currencies}
              value={currency}
              onChange={setCurrency}
            />
          </Box>

          {/* Account select + create */}
          <AccountSelect
            pageText={transactionsPageText.ACCOUNT_SELECT}
            accounts={accountsState}
            value={accountId}
            onChange={setAccountId}
            onCreate={() => setIsCreateModalOpen(true)}
          />
        </Box>
      </Paper>

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

      {/* Bulk category and tags */}
      <BulkActionsPanel
        selectedCount={selectedRows.length}
        label={transactionsPageText.BULK_CATEGORY_BAR.LABEL}
      >
        <BulkCategoryBar
          pageText={transactionsPageText.BULK_CATEGORY_BAR}
          categories={categories}
          onApply={(categoryId) => {
            // this bar has no "None" option, so a category is always chosen
            if (!categoryId) return;
            setRowCategories((prev) => {
              const next = { ...prev };
              selectedRows.forEach((id) => (next[id] = categoryId));
              return next;
            });

            setSelectedRows([]);
          }}
        />
        <BulkTagBar
          text={transactionsPageText.BULK_TAG_BAR}
          options={tagOptions}
          removable={selectedRowTags}
          onAdd={(toAdd) => updateSelectedTags((t) => addTags(t, toAdd))}
          onRemove={(toRemove) =>
            updateSelectedTags((t) => removeTags(t, toRemove))
          }
        />
      </BulkActionsPanel>

      {/* Table */}
      <TransactionsTable
        pageText={transactionsPageText.TABLE}
        rows={sortedRows}
        categories={categories}
        tagOptions={tagOptions}
        rowTags={rowTags}
        onChangeTags={(rowId: string, value: TagValue[]) =>
          setRowTags((prev) => ({ ...prev, [rowId]: value }))
        }
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
      <Paper
        sx={{
          mt: 3,
          p: { xs: 2, md: 2 },
          borderRadius: '20px',
          display: 'grid',
          // stacked below lg; note, counts and buttons in one row from lg
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1fr) auto auto',
          },
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Readiness note: title follows the Save button's enabled state */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            p: 1.5,
            borderRadius: '16px',
            bgcolor: '#FCF7F4',
          }}
        >
          <Image src={star} alt="" aria-hidden width={34} height={31} />
          <Box>
            <Typography fontWeight={700} color="text.primary">
              {areButtonsEnabled
                ? transactionsPageText.FOOTER.READY_TITLE
                : transactionsPageText.FOOTER.NOT_READY_TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {transactionsPageText.FOOTER.READY_TEXT}
            </Typography>
          </Box>
        </Stack>

        {/* Actual counts that will be saved and skipped */}
        {/* the two counts stack on narrower desktops so the row still fits */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', lg: 'column', xl: 'row' },
            flexWrap: 'wrap',
            alignItems: { xs: 'center', lg: 'flex-start', xl: 'center' },
            columnGap: 3,
            rowGap: 1,
            minWidth: 0,
            color: 'text.primary',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ClearAllRoundedIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="body2" fontWeight={600} noWrap>
              {String(transactionsPageText.FOOTER.TRANSACTIONS_COUNT).replace(
                '{count}',
                String(rowsToImport.length),
              )}
            </Typography>
          </Stack>
          {duplicateRows.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <ContentCopyOutlined sx={{ color: 'secondary.main' }} />
              <Typography variant="body2" fontWeight={600} noWrap>
                {String(transactionsPageText.FOOTER.SKIPPED_COUNT).replace(
                  '{count}',
                  String(skippedCount),
                )}
              </Typography>
            </Stack>
          )}
        </Box>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="flex-end"
        >
          <CustomButton
            variantType="text"
            color="secondary"
            onClick={goToHomePage}
            disabledStyling={isSaving}
          >
            {transactionsPageText.FOOTER.BACK_TO_HOME_PAGE}
          </CustomButton>

          <CustomButton
            variantType="primary"
            disabledStyling={!areButtonsEnabled || isSaving}
            onClick={handleTransactionSave}
            startIcon={
              <BarChartOutlined sx={{ fontSize: '1.6rem !important' }} />
            }
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '1.2rem',
              borderRadius: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            {transactionsPageText.FOOTER.SAVE_BUTTON}
            <ArrowForwardRounded sx={{ ml: 1 }} />
          </CustomButton>
        </Stack>
      </Paper>

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
