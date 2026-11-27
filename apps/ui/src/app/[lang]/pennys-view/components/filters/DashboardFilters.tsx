/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Paper } from '@mui/material';
import { useMemo } from 'react';
import { useDashboardFilters } from '@/providers/FilterContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AccountWithActivity, Category } from 'schemas';
import TypeSelect from './TypeSelect';
import AccountFilter from './AccountFilter';
import CategoryFilter from './CategoryFilter';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import YearPresets from '@/components/YearPresets/YearPresets';
import {
  getPresetYears,
  getSelectedPreset,
  yearRange,
} from '@/utils/yearPresets';

interface DashboardFiltersProps {
  accounts: AccountWithActivity[];
  categories: Category[];
  pennysViewPageText: Record<string, any>;
}

const DashboardFilters = ({
  accounts,
  categories,
  pennysViewPageText,
}: DashboardFiltersProps) => {
  const {
    filters,
    appliedFilters,
    setFilters,
    resetFilters,
    applyFilters,
    applyWith,
    isInitialized,
  } = useDashboardFilters();

  const isDirty = JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  const years = useMemo(() => getPresetYears(accounts), [accounts]);

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2 },
        mb: 2.5,
        borderRadius: '20px',
        bgcolor: '#FFFBF9',
      }}
    >
      <Box
        display="grid"
        gap={1.5}
        alignItems="center"
        gridTemplateColumns={{
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          // dates and type stay compact; the multi-selects get the room
          xl: 'repeat(3, minmax(0, 0.8fr)) repeat(2, minmax(0, 1.4fr)) auto auto',
        }}
      >
        <Box gridColumn="1 / -1">
          <YearPresets
            years={years}
            selected={getSelectedPreset(
              appliedFilters.startDate,
              appliedFilters.endDate,
            )}
            onSelectYear={(year) => applyWith(yearRange(year))}
            text={pennysViewPageText.FILTERS.YEAR_PRESETS}
            disabled={!isInitialized}
          />
        </Box>
        {/* Start date */}
        <DatePicker
          label={pennysViewPageText.FILTERS.START_DATE.LABEL}
          value={filters.startDate}
          onChange={(newValue) => setFilters({ startDate: newValue })}
          slotProps={{ textField: { size: 'small' } }}
          format="DD/MM/YYYY"
        />

        {/* End date */}
        <DatePicker
          label={pennysViewPageText.FILTERS.END_DATE.LABEL}
          value={filters.endDate}
          onChange={(newValue) => setFilters({ endDate: newValue })}
          slotProps={{ textField: { size: 'small' } }}
          format="DD/MM/YYYY"
        />

        <TypeSelect pennysViewPageText={pennysViewPageText} />

        {/* <CategoryMultiSelect categories={categories} /> */}
        <CategoryFilter
          categories={categories}
          pennysViewPageText={pennysViewPageText}
        />

        <AccountFilter
          accounts={accounts}
          pennysViewPageText={pennysViewPageText}
        />

        {/* Reset button */}
        <CustomButton
          variantType="outlined"
          onClick={resetFilters}
          sx={{ height: 40, px: 3 }}
        >
          {pennysViewPageText.FILTERS.RESET_BUTTON}
        </CustomButton>

        {/* Apply button */}
        <CustomButton
          variantType="contained"
          onClick={applyFilters}
          sx={{ height: 40, px: 3 }}
          disabled={isInitialized ? !isDirty : true}
        >
          {pennysViewPageText.FILTERS.APPLY_BUTTON}
        </CustomButton>
      </Box>
    </Paper>
  );
};

export default DashboardFilters;
