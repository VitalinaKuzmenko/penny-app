/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { CreateAccountSchema, CreateAccountInput } from 'schemas';
import { createAccount } from '@/requests/createAccount';
import { ApiError } from '@/utils/clientApiFetch';
import { hasCode } from '@/utils/hasCode';

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  pageText: Record<string, any>;
}

export default function CreateAccountModal({
  open,
  onClose,
  onCreated,
  pageText,
}: CreateAccountModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setName(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      const payload: CreateAccountInput = { name };
      CreateAccountSchema.parse(payload);

      await createAccount(payload);

      await onCreated(); // refetch accounts
      setName('');
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && hasCode(err.data)) {
        if (err.data.code === 'account.already_exists') {
          setError(pageText.ERROR_ALREADY_EXISTS);
          return;
        }
      }

      setError(pageText.ERROR_GENERIC);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{pageText.TITLE}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={pageText.NAME_LABEL}
            value={name}
            autoFocus
            fullWidth
            error={Boolean(error)}
            helperText={error}
            onChange={handleAccountNameChange}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <CustomButton
          variantType="text"
          onClick={onClose}
          disabledStyling={isSubmitting}
        >
          {pageText.CANCEL}
        </CustomButton>

        <CustomButton
          variantType="primary"
          onClick={handleSubmit}
          disabledStyling={isSubmitting}
        >
          {pageText.CREATE}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
