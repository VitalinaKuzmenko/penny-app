/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import ImportInfoItem from './ImportInfoItem';
import { GetCurrenciesResponse } from 'schemas';
import { Currency } from './TransactionsClient';

interface CurrencySelectProps {
  pageText: Record<string, any>;
  currencies: GetCurrenciesResponse;
  value: Currency | null;
  onChange: (val: Currency) => void;
}

export default function CurrencySelect({
  pageText,
  currencies,
  value,
  onChange,
}: CurrencySelectProps) {
  const handleChange = (event: SelectChangeEvent) =>
    onChange(event.target.value as Currency);

  return (
    <ImportInfoItem
      icon={<PaymentsOutlined fontSize="inherit" />}
      label={pageText.LABEL}
      labelId="currency-label"
    >
      <FormControl fullWidth size="small">
        <Select
          value={value ?? ''}
          labelId="currency-label"
          onChange={handleChange}
          displayEmpty
          renderValue={(selected) =>
            selected || (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {pageText.PLACEHOLDER}
              </Box>
            )
          }
        >
          <MenuItem value="" disabled>
            {pageText.PLACEHOLDER}
          </MenuItem>

          {currencies.currencies.map((cur) => (
            <MenuItem
              key={cur.code}
              value={cur.code}
              sx={{
                '&:hover': {
                  bgcolor: 'grey.200',
                },
              }}
            >
              {cur.code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ImportInfoItem>
  );
}
