/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Stack,
} from '@mui/material';
import { Account } from 'schemas';

interface AccountSelectProps {
  pageText: Record<string, any>;
  accounts: Account[];
  value: string | null;
  onChange: (val: string) => void;
}

export default function AccountSelect({
  pageText,
  accounts,
  value,
  onChange,
}: AccountSelectProps) {
  const hasAccounts = accounts.length > 0;
  const handleChange = (event: SelectChangeEvent) =>
    onChange(event.target.value);

  const handleCreateNew = () => {
    // TODO: open modal or navigate to create account page
    alert('Create new account clicked');
  };

  return (
    <Stack direction="row" spacing={2} flex={2}>
      <Tooltip
        title={hasAccounts ? '' : `${pageText.TOOLTIP_NO_ACCOUNTS}`}
        placement="top"
      >
        {/* Tooltip requires a non-disabled wrapper */}
        <span style={{ width: '100%' }}>
          <FormControl fullWidth disabled={!hasAccounts}>
            <InputLabel>{pageText.LABEL}</InputLabel>
            <Select value={value ?? ''} label="Account" onChange={handleChange}>
              {hasAccounts &&
                accounts.map((acc) => (
                  <MenuItem
                    key={acc.id}
                    value={acc.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'grey.200',
                      },
                    }}
                  >
                    {acc.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </span>
      </Tooltip>

      <Tooltip title={pageText.CREATE_TOOLTIP}>
        <CustomButton variantType="secondary" onClick={handleCreateNew}>
          {pageText.CREATE_BUTTON}
        </CustomButton>
      </Tooltip>
    </Stack>
  );
}
