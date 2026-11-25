/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { FormEvent, useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CategoryIconName } from 'schemas';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ColourSwatchPicker from '@/components/ColourSwatchPicker/ColourSwatchPicker';
import CategoryIconPicker from '@/components/CategoryIconPicker/CategoryIconPicker';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';

export interface SettingsItemValues {
  name: string;
  color?: string;
  icon?: CategoryIconName;
}

interface SettingsItemDialogProps {
  title: string;
  submitLabel: string;
  initial: SettingsItemValues;
  maxLength: number;
  namePlaceholder: string;
  // shows colour swatches from this palette
  palette?: readonly string[];
  // categories: shows a live preview and the icon grid
  withIcon?: boolean;
  // SETTINGS_PAGE
  text: Record<string, any>;
  onClose: () => void;
  // resolves with an error message to show, or null when saved
  onSubmit: (values: SettingsItemValues) => Promise<string | null>;
}

// Create/edit dialog shared by the three tabs; only the fields differ
export default function SettingsItemDialog({
  title,
  submitLabel,
  initial,
  maxLength,
  namePlaceholder,
  palette,
  withIcon = false,
  text,
  onClose,
  onSubmit,
}: SettingsItemDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [values, setValues] = useState<SettingsItemValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<SettingsItemValues>) => {
    setError(null);
    setValues((v) => ({ ...v, ...patch }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setError(text.COMMON.NAME_REQUIRED);
      return;
    }
    setSubmitting(true);
    const message = await onSubmit({ ...values, name });
    setSubmitting(false);
    if (message) setError(message);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit } }}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {withIcon && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {text.COMMON.PREVIEW_LABEL}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 0.5,
                  minWidth: 0,
                }}
              >
                <CategoryIcon icon={values.icon} color={values.color} />
                <Typography
                  noWrap
                  color={values.name.trim() ? 'text.primary' : 'text.disabled'}
                >
                  {values.name.trim() || namePlaceholder}
                </Typography>
              </Box>
            </Box>
          )}

          <TextField
            label={text.COMMON.NAME_LABEL}
            placeholder={namePlaceholder}
            value={values.name}
            autoFocus
            fullWidth
            error={Boolean(error)}
            helperText={error}
            onChange={(e) => update({ name: e.target.value })}
            slotProps={{ htmlInput: { maxLength } }}
          />

          {palette && values.color && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {text.COMMON.COLOUR_LABEL}
              </Typography>
              <ColourSwatchPicker
                palette={palette}
                value={values.color}
                onChange={(color) => update({ color })}
                label={text.COMMON.COLOUR_LABEL}
              />
            </Box>
          )}

          {withIcon && values.icon && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {text.COMMON.ICON_LABEL}
              </Typography>
              <CategoryIconPicker
                value={values.icon}
                onChange={(icon) => update({ icon })}
                color={values.color ?? theme.palette.text.secondary}
                iconsText={text.ICONS}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CustomButton variantType="text" onClick={onClose}>
          {text.COMMON.CANCEL}
        </CustomButton>
        <CustomButton
          variantType="primary"
          type="submit"
          disabled={submitting}
          loading={submitting}
        >
          {submitLabel}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
