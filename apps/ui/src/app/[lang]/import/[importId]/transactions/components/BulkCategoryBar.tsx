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
import { useState } from 'react';
import { Category } from 'schemas';

interface BulkCategoryBarProps {
  pageText: Record<string, any>;
  categories: Category[];
  selectedRows: string[];
  onApply: (categoryId: string) => void;
}

export default function BulkCategoryBar({
  pageText,
  categories,
  selectedRows,
  onApply,
}: BulkCategoryBarProps) {
  const [bulkCategory, setBulkCategory] = useState<string>('');

  const handleChange = (event: SelectChangeEvent) =>
    setBulkCategory(event.target.value);

  const handleApply = () => {
    if (bulkCategory) {
      onApply(bulkCategory);
      setBulkCategory('');
    }
  };

  if (!selectedRows.length) return null;

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
      <Typography sx={{ flex: 1 }}>
        {selectedRows.length} {pageText.LABEL}
      </Typography>

      <FormControl size="small" sx={{ flex: 2 }}>
        <InputLabel>{pageText.CATEGORY_LABEL}</InputLabel>
        <Select value={bulkCategory} label="Category" onChange={handleChange}>
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
        sx={{ flex: 3 }}
        variantType="secondary"
        onClick={handleApply}
      >
        {pageText.APPLY_BUTTON}
      </CustomButton>
    </Stack>
  );
}
