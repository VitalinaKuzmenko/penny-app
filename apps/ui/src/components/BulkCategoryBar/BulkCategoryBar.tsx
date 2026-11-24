/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useState } from 'react';
import { Category } from 'schemas';
import {
  bulkButtonSx,
  bulkButtonsSx,
  bulkRowSx,
} from '@/components/BulkActionsPanel/BulkActionsPanel';

// Select can't use '' as a real option value, it means "nothing chosen"
const NONE_VALUE = '__none__';

interface BulkCategoryBarProps {
  pageText: Record<string, any>;
  categories: Category[];
  // null = clear the category; only sent when pageText.NONE_OPTION is set
  onApply: (categoryId: string | null) => void;
}

// Category control for BulkActionsPanel
export default function BulkCategoryBar({
  pageText,
  categories,
  onApply,
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

  return (
    <Box sx={bulkRowSx}>
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel>{pageText.CATEGORY_LABEL}</InputLabel>
        <Select
          value={bulkCategory}
          label={pageText.CATEGORY_LABEL}
          onChange={handleChange}
        >
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

      <Box sx={bulkButtonsSx}>
        <CustomButton
          variantType="secondary"
          onClick={handleApply}
          disabled={!bulkCategory}
          sx={bulkButtonSx}
        >
          {pageText.APPLY_BUTTON}
        </CustomButton>
      </Box>
    </Box>
  );
}
