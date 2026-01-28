'use client';

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { Category } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';

interface Props {
  categories: Category[];
}

const CategoryMultiSelect = ({ categories }: Props) => {
  const { filters, setFilters } = useDashboardFilters();

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters({
      categoryIds: typeof value === 'string' ? value.split(',') : value,
    });
  };

  return (
    <FormControl size="small" sx={{ minWidth: 220, display: 'flex' }}>
      <InputLabel>Categories</InputLabel>

      <Select
        multiple
        label="Categories"
        value={filters.categoryIds}
        onChange={handleChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return (
                <Chip key={id} label={cat?.name ?? 'Unknown'} size="small" />
              );
            })}
          </Box>
        )}
      >
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </Select>

      <MenuItem onClick={() => setFilters({ categoryIds: [] })}>
        Clear selection
      </MenuItem>
    </FormControl>
  );
};

export default CategoryMultiSelect;
