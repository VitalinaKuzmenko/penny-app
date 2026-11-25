/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import {
  Box,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Account, Category, Tag } from 'schemas';
import FilterMultiSelect from '@/components/FilterMultiSelect/FilterMultiSelect';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import {
  MoneyJournalTypeFilter,
  UNCATEGORISED_ID,
  UNTAGGED_ID,
  useMoneyJournalFilters,
} from '@/providers/MoneyJournalFilterContext';

const types: MoneyJournalTypeFilter[] = ['ALL', 'INCOME', 'EXPENSE', 'REFUND'];

interface MoneyJournalFiltersProps {
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  pageText: Record<string, any>;
  // Apply goes through the page so unsaved edits can be confirmed first
  onApply: () => void;
}

export default function MoneyJournalFilters({
  accounts,
  categories,
  tags,
  pageText,
  onApply,
}: MoneyJournalFiltersProps) {
  const { filters, appliedFilters, setFilters, resetFilters, isInitialized } =
    useMoneyJournalFilters();
  const text = pageText.FILTERS;

  const isDirty = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  const categoryItems = useMemo(
    () => [
      ...categories.map((c) => ({
        id: c.id,
        label: c.name,
        icon: <CategoryIcon icon={c.icon} color={c.color} />,
      })),
      { id: UNCATEGORISED_ID, label: text.CATEGORY_FILTER.UNCATEGORISED },
    ],
    [categories, text],
  );
  const accountItems = useMemo(
    () => accounts.map((a) => ({ id: a.id, label: a.name })),
    [accounts],
  );
  const tagItems = useMemo(
    () => [
      ...tags.map((t) => ({ id: t.id, label: t.name })),
      { id: UNTAGGED_ID, label: text.TAG_FILTER.UNTAGGED },
    ],
    [tags, text],
  );

  return (
    <Box
      display="grid"
      gap={2}
      mb={3}
      gridTemplateColumns={{
        xs: '1fr',
        sm: '1fr 1fr',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
      }}
      alignItems="center"
    >
      <DatePicker
        label={text.START_DATE.LABEL}
        value={filters.startDate}
        onChange={(startDate) => setFilters({ startDate })}
        slotProps={{ textField: { size: 'small' } }}
        format="DD/MM/YYYY"
      />

      <DatePicker
        label={text.END_DATE.LABEL}
        value={filters.endDate}
        onChange={(endDate) => setFilters({ endDate })}
        slotProps={{ textField: { size: 'small' } }}
        format="DD/MM/YYYY"
      />

      <TextField
        select
        size="small"
        label={text.TYPE_SELECT.LABEL}
        value={filters.type}
        onChange={(e) =>
          setFilters({ type: e.target.value as MoneyJournalTypeFilter })
        }
      >
        {types.map((t) => (
          <MenuItem key={t} value={t}>
            {text.TYPE_SELECT.OPTIONS[t]}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        label={text.SEARCH.LABEL}
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isDirty) onApply();
        }}
      />

      <FilterMultiSelect
        label={text.CATEGORY_FILTER.LABEL}
        items={categoryItems}
        value={filters.categoryIds}
        onChange={(categoryIds) => setFilters({ categoryIds })}
        minWidth={0}
      />

      <FilterMultiSelect
        label={text.ACCOUNT_FILTER.LABEL}
        items={accountItems}
        value={filters.accountIds}
        onChange={(accountIds) => setFilters({ accountIds })}
        minWidth={0}
      />

      <FilterMultiSelect
        label={text.TAG_FILTER.LABEL}
        items={tagItems}
        value={filters.tagIds}
        clearAllLabel={text.TAG_FILTER.CLEAR_ALL}
        // every tag plus Untagged is the same as no filter; stored as [] so a tag
        // created later doesn't turn "everything" into a real filter
        onChange={(tagIds) =>
          setFilters({
            tagIds: tagIds.length === tagItems.length ? [] : tagIds,
          })
        }
        minWidth={0}
      />

      <FormControlLabel
        control={
          <Switch
            checked={filters.showDeleted}
            onChange={(e) => setFilters({ showDeleted: e.target.checked })}
          />
        }
        label={text.SHOW_DELETED}
      />

      <Box display="flex" gap={2}>
        <CustomButton
          variantType="secondary"
          onClick={resetFilters}
          sx={{ flex: 1 }}
        >
          {text.RESET_BUTTON}
        </CustomButton>
        <CustomButton
          variantType="primary"
          onClick={onApply}
          disabled={isInitialized ? !isDirty : true}
          sx={{ flex: 1 }}
        >
          {text.APPLY_BUTTON}
        </CustomButton>
      </Box>
    </Box>
  );
}
