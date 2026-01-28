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
}

const DashboardFilters = ({ accounts, categories }: DashboardFiltersProps) => {
  const { filters, setFilters, resetFilters } = useDashboardFilters();

  return (
    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
      {/* Start date */}
      <DatePicker
        label="From"
        value={filters.startDate}
        onChange={(newValue) => setFilters({ startDate: newValue })}
        slotProps={{ textField: { size: 'small' } }}
      />

      {/* End date */}
      <DatePicker
        label="To"
        value={filters.endDate}
        onChange={(newValue) => setFilters({ endDate: newValue })}
        slotProps={{ textField: { size: 'small' } }}
      />

      <TypeSelect />

      {/* <CategoryMultiSelect categories={categories} /> */}
      <CategoryFilter categories={categories} />

      <AccountFilter accounts={accounts} />

      {/* Reset button */}
      <CustomButton variantType="secondary" onClick={resetFilters}>
        Reset
      </CustomButton>
    </Box>
  );
};

export default DashboardFilters;
