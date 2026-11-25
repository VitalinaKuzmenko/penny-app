/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Chip,
  FormControl,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { Category } from 'schemas';
import CategoryLabel from '@/components/CategoryLabel/CategoryLabel';

interface CategoryCellSelectProps {
  // money in offers income / transfer / "refund for…"; money out offers plain categories
  isMoneyIn: boolean;
  // '' means no category
  value: string;
  onChange: (categoryId: string) => void;
  categories: Category[];
  pageText: Record<string, any>;
  // money-out rows only: label for clearing the category (omit to not offer it)
  noneLabel?: string;
  isAutoAssigned?: boolean;
  // show the "none" label instead of a blank select when nothing is chosen
  displayEmpty?: boolean;
  disabled?: boolean;
}

const chipSx = { mr: 0.5, height: 18, fontSize: 10 };

export default function CategoryCellSelect({
  isMoneyIn,
  value,
  onChange,
  categories,
  pageText,
  noneLabel,
  isAutoAssigned = false,
  displayEmpty = false,
  disabled = false,
}: CategoryCellSelectProps) {
  const transferCategory = categories.find((cat) => cat.isTransfer);
  const isRefund =
    isMoneyIn && Boolean(value) && value !== transferCategory?.id;

  // MUI Select needs MenuItems as direct children — no Fragment wrapper
  const options = isMoneyIn
    ? [
        <MenuItem key="none" value="">
          {pageText.CUSTOM_CATEGORY_CELL_NAME}
        </MenuItem>,
        ...(transferCategory
          ? [
              <MenuItem key={transferCategory.id} value={transferCategory.id}>
                <CategoryLabel category={transferCategory} />
              </MenuItem>,
            ]
          : []),
        <ListSubheader key="refund-header">
          {pageText.REFUND_GROUP_LABEL}
        </ListSubheader>,
        ...categories
          .filter((cat) => cat.id !== transferCategory?.id)
          .map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              <CategoryLabel category={cat} />
            </MenuItem>
          )),
      ]
    : [
        ...(noneLabel
          ? [
              <MenuItem key="none" value="">
                {noneLabel}
              </MenuItem>,
            ]
          : []),
        ...categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            <CategoryLabel category={cat} />
          </MenuItem>
        )),
      ];

  return (
    <FormControl
      size="small"
      fullWidth
      sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
    >
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        displayEmpty={displayEmpty}
        sx={{ width: '100%' }}
        startAdornment={
          isAutoAssigned || isRefund ? (
            <>
              {isRefund && (
                <Chip
                  label={pageText.REFUND_CHIP}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={chipSx}
                />
              )}
              {isAutoAssigned && (
                <Chip
                  label="auto"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={chipSx}
                />
              )}
            </>
          ) : undefined
        }
      >
        {options}
      </Select>
    </FormControl>
  );
}
