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
import { useMemo } from 'react';

const ALL_VALUE = '__ALL__';
const MAX_VISIBLE_CHIPS = 2;

export interface FilterItem {
  id: string;
  label: string;
}

interface FilterMultiSelectProps {
  label: string;
  items: FilterItem[];
  value: string[];
  onChange: (ids: string[]) => void;
  minWidth?: number;
}

const FilterMultiSelect = ({
  label,
  items,
  value,
  onChange,
  minWidth = 260,
}: FilterMultiSelectProps) => {
  const allIds = useMemo(() => items.map((i) => i.id), [items]);
  const isAllSelected = value.length === allIds.length && allIds.length > 0;

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selected = event.target.value as string[];

    if (selected.includes(ALL_VALUE)) {
      onChange(isAllSelected ? [] : allIds);
      return;
    }

    onChange(selected);
  };

  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel>{label}</InputLabel>

      <Select
        multiple
        label={label}
        value={value}
        onChange={handleChange}
        renderValue={(selected) => {
          const selectedItems = items.filter((i) => selected.includes(i.id));

          const visible = selectedItems.slice(0, MAX_VISIBLE_CHIPS);
          const hiddenCount = selectedItems.length - visible.length;

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
              {visible.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
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

        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            sx={{
              '&:hover': {
                bgcolor: 'grey.200',
              },
            }}
          >
            <Checkbox checked={value.includes(item.id)} />
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterMultiSelect;
