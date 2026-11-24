/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { interpolate } from '@/utils/interpolate';

interface DiscardChangesDialogProps {
  open: boolean;
  count: number;
  pageText: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DiscardChangesDialog({
  open,
  count,
  pageText,
  onConfirm,
  onCancel,
}: DiscardChangesDialogProps) {
  const text = pageText.DISCARD_DIALOG;

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{text.TITLE}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {interpolate(text.MESSAGE, { count })}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CustomButton variantType="text" onClick={onCancel}>
          {text.CANCEL}
        </CustomButton>
        <CustomButton variantType="primary" color="error" onClick={onConfirm}>
          {text.CONFIRM}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
