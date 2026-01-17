/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
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
    <FormControl fullWidth sx={{ flex: 1 }}>
      <InputLabel id="currency-label">{pageText.LABEL}</InputLabel>
      <Select value={value ?? ''} label="Currency" onChange={handleChange}>
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
  );
}
