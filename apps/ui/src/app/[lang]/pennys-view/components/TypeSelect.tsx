import {
  TransactionTypeFilter,
  useDashboardFilters,
} from '@/providers/FilterContext';
import { MenuItem, TextField } from '@mui/material';

const types: TransactionTypeFilter[] = ['ALL', 'INCOME', 'EXPENSE'];

const TypeSelect = () => {
  const { filters, setFilters } = useDashboardFilters();
  return (
    <TextField
      select
      size="small"
      label="Type"
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
