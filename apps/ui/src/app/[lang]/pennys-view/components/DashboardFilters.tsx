'use client';

import { Box, Button } from '@mui/material';
import { useDashboardFilters } from '@/providers/FilterContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CategoryMultiSelect from './CategoryMultiSelect';
import { Account, Category } from 'schemas';
import TypeSelect from './TypeSelect';

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

      <CategoryMultiSelect categories={categories} />

      {/* Reset button */}
      <Button variant="outlined" size="small" onClick={resetFilters}>
        Reset
      </Button>
    </Box>
  );
};

export default DashboardFilters;
