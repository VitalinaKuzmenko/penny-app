/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import {
  Stack,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import { Category } from 'schemas';

// Select can't use '' as a real option value, it means "nothing chosen"
const NONE_VALUE = '__none__';

interface BulkCategoryBarProps {
  pageText: Record<string, any>;
  categories: Category[];
  selectedRows: string[];
  // null = clear the category; only sent when pageText.NONE_OPTION is set
  onApply: (categoryId: string | null) => void;
  // extra buttons for the selection, e.g. delete
  actions?: ReactNode;
}

export default function BulkCategoryBar({
  pageText,
  categories,
  selectedRows,
  onApply,
  actions,
}: BulkCategoryBarProps) {
  const [bulkCategory, setBulkCategory] = useState<string>('');

  const handleChange = (event: SelectChangeEvent) =>
    setBulkCategory(event.target.value);

  const handleApply = () => {
    if (bulkCategory) {
      onApply(bulkCategory === NONE_VALUE ? null : bulkCategory);
      setBulkCategory('');
    }
  };

  if (!selectedRows.length) return null;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      mb={2}
      alignItems="center"
    >
      <Typography sx={{ flex: 1 }}>
        {selectedRows.length} {pageText.LABEL}
      </Typography>

      <FormControl size="small" sx={{ flex: 2 }}>
        <InputLabel>{pageText.CATEGORY_LABEL}</InputLabel>
        <Select value={bulkCategory} label="Category" onChange={handleChange}>
          {pageText.NONE_OPTION && (
            <MenuItem value={NONE_VALUE}>{pageText.NONE_OPTION}</MenuItem>
          )}
          {categories.map((cat) => (
            <MenuItem
              key={cat.id}
              value={cat.id}
              sx={{
                '&:hover': {
                  bgcolor: 'grey.200',
                },
              }}
            >
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <CustomButton
        sx={{ flex: 3, width: '220px', maxWidth: '220px', minWidth: '220px' }}
        variantType="secondary"
        onClick={handleApply}
      >
        {pageText.APPLY_BUTTON}
      </CustomButton>

      {actions}
    </Stack>
  );
}
