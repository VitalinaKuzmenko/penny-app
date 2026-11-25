/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { Category } from 'schemas';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import CategoryLabel from '@/components/CategoryLabel/CategoryLabel';
import { interpolate } from '@/utils/interpolate';

interface DeleteCategoryDialogProps {
  category: Category;
  categories: Category[];
  // SETTINGS_PAGE
  text: Record<string, any>;
  onClose: () => void;
  onRenameInstead: () => void;
  // resolves with an error message to show, or null when deleted
  onConfirm: (replacementCategoryId?: string) => Promise<string | null>;
}

// With transactions, a replacement category is required (never the transfer one)
export default function DeleteCategoryDialog({
  category,
  categories,
  text,
  onClose,
  onRenameInstead,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const dialogText = text.CATEGORIES.DELETE_DIALOG;
  const hasTransactions = category.transactionCount > 0;
  const replacements = categories.filter(
    (c) => c.id !== category.id && !c.isTransfer,
  );

  const [replacementId, setReplacementId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    const result = await onConfirm(hasTransactions ? replacementId : undefined);
    setSubmitting(false);
    if (result) setError(result);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ overflowWrap: 'anywhere' }}>
        {interpolate(dialogText.TITLE, { name: category.name })}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            {hasTransactions
              ? interpolate(dialogText.MESSAGE_WITH_TRANSACTIONS, {
                  count: category.transactionCount,
                })
              : dialogText.MESSAGE_EMPTY}
          </DialogContentText>

          {hasTransactions &&
            (replacements.length ? (
              <FormControl fullWidth>
                <InputLabel id="replacement-category-label">
                  {dialogText.REPLACEMENT_LABEL}
                </InputLabel>
                <Select
                  labelId="replacement-category-label"
                  label={dialogText.REPLACEMENT_LABEL}
                  value={replacementId}
                  onChange={(e) => {
                    setError(null);
                    setReplacementId(e.target.value);
                  }}
                >
                  {replacements.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <CategoryLabel category={c} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info">{dialogText.NO_REPLACEMENT}</Alert>
            ))}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <CustomButton variantType="text" onClick={onClose}>
          {text.COMMON.CANCEL}
        </CustomButton>
        {hasTransactions && (
          <CustomButton variantType="secondary" onClick={onRenameInstead}>
            {dialogText.RENAME_INSTEAD}
          </CustomButton>
        )}
        {(!hasTransactions || replacements.length > 0) && (
          <CustomButton
            variantType="primary"
            color="error"
            onClick={handleConfirm}
            disabled={submitting || (hasTransactions && !replacementId)}
            loading={submitting}
          >
            {hasTransactions ? dialogText.MOVE_AND_DELETE : text.COMMON.DELETE}
          </CustomButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
