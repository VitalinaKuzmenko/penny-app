'use client';

import React from 'react';
import { Box, TextField, MenuItem, Button } from '@mui/material';
import {
  useDashboardFilters,
  TransactionTypeFilter,
} from '@/providers/FilterContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const types: TransactionTypeFilter[] = ['BOTH', 'INCOME', 'EXPENSE'];

const DashboardFilters = () => {
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

      {/* Type select */}
      <TextField
        select
        size="small"
        label="Type"
        value={filters.type}
        onChange={(e) =>
          setFilters({ type: e.target.value as TransactionTypeFilter })
        }
      >
        {types.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>

      {/* Reset button */}
      <Button variant="outlined" size="small" onClick={resetFilters}>
        Reset
      </Button>
    </Box>
  );
};

export default DashboardFilters;
