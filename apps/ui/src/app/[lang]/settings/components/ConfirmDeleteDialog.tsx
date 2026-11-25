'use client';

import { useState } from 'react';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import CustomButton from '@/components/ui/CustomButton/CustomButton';

interface ConfirmDeleteDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onClose: () => void;
  // resolves with an error message to show, or null when deleted
  onConfirm: () => Promise<string | null>;
}

export default function ConfirmDeleteDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    const result = await onConfirm();
    setSubmitting(false);
    if (result) setError(result);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ overflowWrap: 'anywhere' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CustomButton variantType="text" onClick={onClose}>
          {cancelLabel}
        </CustomButton>
        <CustomButton
          variantType="primary"
          color="error"
          onClick={handleConfirm}
          disabled={submitting}
          loading={submitting}
        >
          {confirmLabel}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
