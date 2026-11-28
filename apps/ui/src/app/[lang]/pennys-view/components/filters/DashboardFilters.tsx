/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box } from '@mui/material';
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

// small buttons so Reset and Apply fit on the same row as the filters
const compactButtonSx = {
  height: 32,
  minWidth: 0,
  px: 1.5,
  py: 0,
  fontSize: '0.8rem',
  borderRadius: '10px',
} as const;

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
    // no card around the filters: each control sits directly on the page background
    <Box
      sx={{
        mb: 2.5,
        // inputs show the page background; only their option lists stay white
        '& .MuiOutlinedInput-root': { bgcolor: 'transparent' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
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
            onSelectYear={(year) => applyWith(yearRange(year))}
            text={pennysViewPageText.FILTERS.YEAR_PRESETS}
            disabled={!isInitialized}
          />
        </Box>

        {/* Start date */}
        <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
          <DatePicker
            label={pennysViewPageText.FILTERS.START_DATE.LABEL}
            value={filters.startDate}
            onChange={(newValue) => setFilters({ startDate: newValue })}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD/MM/YYYY"
          />
        </Box>

        {/* End date */}
        <Box sx={{ flex: '1 1 150px', minWidth: 0 }}>
          <DatePicker
            label={pennysViewPageText.FILTERS.END_DATE.LABEL}
            value={filters.endDate}
            onChange={(newValue) => setFilters({ endDate: newValue })}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD/MM/YYYY"
          />
        </Box>

        <Box sx={{ flex: '1 1 130px', minWidth: 0 }}>
          <TypeSelect pennysViewPageText={pennysViewPageText} />
        </Box>

        <Box sx={{ flex: '2 1 220px', minWidth: 0 }}>
          <CategoryFilter
            categories={categories}
            pennysViewPageText={pennysViewPageText}
          />
        </Box>

        <Box sx={{ flex: '2 1 220px', minWidth: 0 }}>
          <AccountFilter
            accounts={accounts}
            pennysViewPageText={pennysViewPageText}
          />
        </Box>

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
            onClick={resetFilters}
            sx={compactButtonSx}
          >
            {pennysViewPageText.FILTERS.RESET_BUTTON}
          </CustomButton>

          <CustomButton
            variantType="contained"
            onClick={applyFilters}
            sx={compactButtonSx}
            disabled={isInitialized ? !isDirty : true}
          >
            {pennysViewPageText.FILTERS.APPLY_BUTTON}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardFilters;
