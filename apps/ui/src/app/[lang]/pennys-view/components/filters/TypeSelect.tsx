/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TransactionTypeFilter,
  useDashboardFilters,
} from '@/providers/FilterContext';
import { MenuItem, TextField } from '@mui/material';

const types: TransactionTypeFilter[] = ['ALL', 'INCOME', 'EXPENSE'];

interface TypeSelectProps {
  pennysViewPageText: Record<string, any>;
}

const TypeSelect = ({ pennysViewPageText }: TypeSelectProps) => {
  const { filters, setFilters } = useDashboardFilters();
  return (
    <TextField
      select
      size="small"
      label={pennysViewPageText.FILTERS.TYPE_SELECT.LABEL}
      value={filters.type}
      onChange={(e) =>
        setFilters({ type: e.target.value as TransactionTypeFilter })
      }
      sx={{ minWidth: 130 }}
    >
      {types.map((t) => (
        <MenuItem
          key={t}
          value={t}
          sx={{
            '&:hover': {
              bgcolor: 'grey.200',
            },
          }}
        >
          {t}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TypeSelect;
