'use client';

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Divider,
  ListItemText,
  Checkbox,
} from '@mui/material';
import { Category } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';
import { useMemo } from 'react';

const ALL_VALUE = '__ALL__';
const MAX_VISIBLE_CHIPS = 2;

interface CategoryMultiSelectProps {
  categories: Category[];
}

const CategoryMultiSelect = ({ categories }: CategoryMultiSelectProps) => {
  const { filters, setFilters } = useDashboardFilters();

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.name !== 'Internal Transfer'),
    [categories],
  );

  const allCategoryIds = visibleCategories.map((c) => c.id);
  const isAllSelected = filters.categoryIds.length === allCategoryIds.length;

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];

    if (value.includes(ALL_VALUE)) {
      setFilters({
        categoryIds: isAllSelected ? [] : allCategoryIds,
      });
      return;
    }

    setFilters({ categoryIds: value });
  };

  return (
    <FormControl size="small" sx={{ minWidth: 260 }}>
      <InputLabel>Categories</InputLabel>

      <Select
        multiple
        label="Categories"
        value={filters.categoryIds}
        onChange={handleChange}
        renderValue={(selected) => {
          const selectedCategories = visibleCategories.filter((c) =>
            selected.includes(c.id),
          );

          const visible = selectedCategories.slice(0, MAX_VISIBLE_CHIPS);
          const hiddenCount = selectedCategories.length - visible.length;

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: 0.5,
                overflow: 'hidden',
              }}
            >
              {visible.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  sx={{ maxWidth: 120 }}
                />
              ))}

              {hiddenCount > 0 && (
                <Chip
                  label={`+${hiddenCount}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          );
        }}
      >
        {/* Select / Clear all */}
        <MenuItem
          value={ALL_VALUE}
          sx={{
            '&:hover': {
              bgcolor: 'grey.200',
            },
          }}
        >
          <Checkbox checked={isAllSelected} />
          <ListItemText primary={isAllSelected ? 'Clear all' : 'Select all'} />
        </MenuItem>

        <Divider />

        {visibleCategories.map((cat) => (
          <MenuItem
            key={cat.id}
            value={cat.id}
            sx={{
              '&:hover': {
                bgcolor: 'grey.200',
              },
            }}
          >
            <Checkbox checked={filters.categoryIds.includes(cat.id)} />
            <ListItemText primary={cat.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategoryMultiSelect;
