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
  accounts: Account[];
  value: string | null;
  onChange: (val: string) => void;
}

export default function AccountSelect({
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
        title={
          hasAccounts
            ? ''
            : 'You have no accounts. You need to create an account first.'
        }
        placement="top"
      >
        {/* Tooltip requires a non-disabled wrapper */}
        <span style={{ width: '100%' }}>
          <FormControl fullWidth disabled={!hasAccounts}>
            <InputLabel>Account</InputLabel>
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
      {/* TODO: explain what is an account */}
      <Tooltip title="Explanation what is account">
        <CustomButton variantType="secondary" onClick={handleCreateNew}>
          Create new account
        </CustomButton>
      </Tooltip>
    </Stack>
  );
}
