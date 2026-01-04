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
  currencies: GetCurrenciesResponse;
  value: Currency | null;
  onChange: (val: Currency) => void;
}

export default function CurrencySelect({
  currencies,
  value,
  onChange,
}: CurrencySelectProps) {
  const handleChange = (event: SelectChangeEvent) =>
    onChange(event.target.value as Currency);

  return (
    <FormControl fullWidth sx={{ flex: 1 }}>
      <InputLabel id="currency-label">Currency</InputLabel>
      <Select value={value ?? ''} label="Currency" onChange={handleChange}>
        <MenuItem value="" disabled>
          Select currency
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
