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
  ListItemIcon,
} from '@mui/material';
import { ReactElement, useMemo } from 'react';
import { tagChipSx } from '@/components/TagChips/TagChips';

const ALL_VALUE = '__ALL__';
const MAX_VISIBLE_CHIPS = 2;

export interface FilterItem {
  id: string;
  label: string;
  // e.g. a category icon, shown in the menu and on the selected chips
  icon?: ReactElement;
  // tag colour: the selected chip gets the shared tinted tag style
  color?: string | null;
}

interface FilterMultiSelectProps {
  label: string;
  items: FilterItem[];
  value: string[];
  onChange: (ids: string[]) => void;
  minWidth?: number;
  // For filters where nothing selected already means "everything": the top
  // option only clears the selection, under this label
  clearAllLabel?: string;
}

const FilterMultiSelect = ({
  label,
  items,
  value,
  onChange,
  minWidth = 260,
  clearAllLabel,
}: FilterMultiSelectProps) => {
  const allIds = useMemo(() => items.map((i) => i.id), [items]);
  // value may hold ids that aren't offered here (e.g. hidden transfer
  // categories), so compare against the offered items, not the length
  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => value.includes(id));

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selected = event.target.value as string[];

    if (selected.includes(ALL_VALUE)) {
      onChange(clearAllLabel || isAllSelected ? [] : allIds);
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
                  icon={item.icon}
                  size="small"
                  sx={{
                    maxWidth: 120,
                    ...(item.color !== undefined && tagChipSx(item.color)),
                  }}
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
        {clearAllLabel ? (
          <MenuItem
            value={ALL_VALUE}
            disabled={value.length === 0}
            sx={{ '&:hover': { bgcolor: 'grey.200' } }}
          >
            <ListItemText primary={clearAllLabel} />
          </MenuItem>
        ) : (
          <MenuItem
            value={ALL_VALUE}
            sx={{
              '&:hover': {
                bgcolor: 'grey.200',
              },
            }}
          >
            <Checkbox checked={isAllSelected} />
            <ListItemText
              primary={isAllSelected ? 'Clear all' : 'Select all'}
            />
          </MenuItem>
        )}

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
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
            )}
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterMultiSelect;
