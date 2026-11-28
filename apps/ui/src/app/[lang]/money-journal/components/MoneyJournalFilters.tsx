/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import {
  Box,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AccountWithActivity, Category, Tag } from 'schemas';
import FilterMultiSelect from '@/components/FilterMultiSelect/FilterMultiSelect';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import YearPresets from '@/components/YearPresets/YearPresets';
import {
  MoneyJournalFilters as Filters,
  MoneyJournalTypeFilter,
  UNCATEGORISED_ID,
  UNTAGGED_ID,
  useMoneyJournalFilters,
} from '@/providers/MoneyJournalFilterContext';
import {
  getPresetYears,
  getSelectedPreset,
  yearRange,
} from '@/utils/yearPresets';

const types: MoneyJournalTypeFilter[] = ['ALL', 'INCOME', 'EXPENSE', 'REFUND'];

interface MoneyJournalFiltersProps {
  accounts: AccountWithActivity[];
  categories: Category[];
  tags: Tag[];
  pageText: Record<string, any>;
  // Apply, Reset and the year presets go through the page so unsaved edits
  // can be confirmed first
  onApply: () => void;
  onApplyWith: (filters: Partial<Filters>) => void;
  onReset: () => void;
}

// same compact buttons as the Penny's View filters
const compactButtonSx = {
  height: 32,
  minWidth: 0,
  px: 1.5,
  py: 0,
  fontSize: '0.8rem',
  borderRadius: '10px',
} as const;

export default function MoneyJournalFilters({
  accounts,
  categories,
  tags,
  pageText,
  onApply,
  onApplyWith,
  onReset,
}: MoneyJournalFiltersProps) {
  const { filters, appliedFilters, setFilters, isInitialized } =
    useMoneyJournalFilters();
  const text = pageText.FILTERS;

  const isDirty = JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  const years = useMemo(() => getPresetYears(accounts), [accounts]);

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
      ...tags.map((t) => ({ id: t.id, label: t.name, color: t.color })),
      { id: UNTAGGED_ID, label: text.TAG_FILTER.UNTAGGED },
    ],
    [tags, text],
  );

  return (
    // no card around the filters: controls sit on the page background, as on Penny's View
    <Box
      sx={{
        mb: 2.5,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        '& .MuiOutlinedInput-root': { bgcolor: 'transparent' },
        // every control fills its flex item, whatever the screen size
        '& .MuiFormControl-root': { width: '100%', minWidth: 0 },
      }}
    >
      <Box sx={{ flex: '1 1 100%' }}>
        <YearPresets
          years={years}
          selected={getSelectedPreset(
            appliedFilters.startDate,
            appliedFilters.endDate,
          )}
          onSelectYear={(year) => onApplyWith(yearRange(year))}
          onSelectAllTime={() =>
            onApplyWith({ startDate: null, endDate: null })
          }
          text={text.YEAR_PRESETS}
          disabled={!isInitialized}
        />
      </Box>

      <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
        <DatePicker
          label={text.START_DATE.LABEL}
          value={filters.startDate}
          onChange={(startDate) => setFilters({ startDate })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          format="DD/MM/YYYY"
        />
      </Box>

      <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
        <DatePicker
          label={text.END_DATE.LABEL}
          value={filters.endDate}
          onChange={(endDate) => setFilters({ endDate })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          format="DD/MM/YYYY"
        />
      </Box>

      <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
        <TextField
          select
          size="small"
          fullWidth
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
      </Box>

      <Box sx={{ flex: '2 1 240px', minWidth: 0 }}>
        <TextField
          size="small"
          fullWidth
          label={text.SEARCH.LABEL}
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isDirty) onApply();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* forces the multi-selects onto their own row on wide screens */}
      <Box
        sx={{
          flexBasis: '100%',
          height: 0,
          display: { xs: 'none', lg: 'block' },
        }}
      />

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <FilterMultiSelect
          label={text.CATEGORY_FILTER.LABEL}
          items={categoryItems}
          value={filters.categoryIds}
          onChange={(categoryIds) => setFilters({ categoryIds })}
          minWidth={0}
        />
      </Box>

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <FilterMultiSelect
          label={text.ACCOUNT_FILTER.LABEL}
          items={accountItems}
          value={filters.accountIds}
          onChange={(accountIds) => setFilters({ accountIds })}
          minWidth={0}
        />
      </Box>

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
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
      </Box>

      <FormControlLabel
        sx={{ flex: '0 0 auto', m: 0, whiteSpace: 'nowrap' }}
        control={
          <Switch
            color="secondary"
            checked={filters.showDeleted}
            onChange={(e) => setFilters({ showDeleted: e.target.checked })}
          />
        }
        label={text.SHOW_DELETED}
      />

      {/* Buttons wrap as one group, never one by one */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flex: { xs: '1 1 100%', sm: '0 0 auto' },
          '& > *': { flex: { xs: 1, sm: '0 0 auto' } },
        }}
      >
        <CustomButton
          variantType="outlined"
          color="secondary"
          onClick={onReset}
          sx={compactButtonSx}
        >
          {text.RESET_BUTTON}
        </CustomButton>
        <CustomButton
          variantType="contained"
          onClick={onApply}
          disabled={isInitialized ? !isDirty : true}
          sx={compactButtonSx}
        >
          {text.APPLY_BUTTON}
        </CustomButton>
      </Box>
    </Box>
  );
}
