/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box } from '@mui/material';
import { useDashboardFilters } from '@/providers/FilterContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Account, Category } from 'schemas';
import TypeSelect from './TypeSelect';
import AccountFilter from './AccountFilter';
import CategoryFilter from './CategoryFilter';
import CustomButton from '@/components/ui/CustomButton/CustomButton';

interface DashboardFiltersProps {
  accounts: Account[];
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
    isInitialized,
  } = useDashboardFilters();

  const isDirty = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  return (
    <Box
      display="grid"
      gap={2}
      mb={3}
      gridTemplateColumns={{
        xs: '1fr',
        sm: '1fr 1fr',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(7, 1fr)',
      }}
    >
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
      <CustomButton variantType="secondary" onClick={resetFilters}>
        {pennysViewPageText.FILTERS.RESET_BUTTON}
      </CustomButton>

      {/* Apply button */}
      <CustomButton
        variantType="primary"
        onClick={applyFilters}
        disabled={isInitialized ? !isDirty : true}
      >
        {pennysViewPageText.FILTERS.APPLY_BUTTON}
      </CustomButton>
    </Box>
  );
};

export default DashboardFilters;
