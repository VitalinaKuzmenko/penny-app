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
import { alpha } from '@mui/material/styles';
import Image from 'next/image';
import { CategoryIconName } from 'schemas';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ColourSwatchPicker from '@/components/ColourSwatchPicker/ColourSwatchPicker';
import CategoryIconPicker from '@/components/CategoryIconPicker/CategoryIconPicker';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';
import leaves from '../../../../../public/leaves.png';
import linesLight from '../../../../../public/lines_light_back.png';
import linesDark from '../../../../../public/lined_dark_back.png';

export interface SettingsItemValues {
  name: string;
  color?: string;
  icon?: CategoryIconName;
}

interface SettingsItemDialogProps {
  title: string;
  subtitle?: string;
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
  subtitle,
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

  const labelSx = { fontWeight: 700, color: 'text.primary', mb: 1 };
  const nameId = 'settings-item-name';
  const previewName = values.name.trim();

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
          sx: {
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#FCF7F4',
            borderRadius: fullScreen ? 0 : '28px',
            boxShadow: '0 24px 60px rgba(83, 36, 70, 0.22)',
          },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -10,
          right: -12,
          width: { xs: 140, sm: 190 },
          pointerEvents: 'none',
        }}
      >
        <Image src={leaves} alt="" style={{ width: '100%', height: 'auto' }} />
      </Box>

      <DialogTitle
        sx={(t) => ({
          ...t.typography.h4,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          pt: 3.5,
          pb: subtitle ? 0.5 : 2,
          px: { xs: 2.5, sm: 4 },
          pr: { xs: 14, sm: 20 },
          color: 'secondary.main',
          fontSize: { xs: '1.75rem', sm: '2.1rem' },
        })}
      >
        {title}
        <Image src={linesLight} alt="" aria-hidden width={18} height={23} />
      </DialogTitle>
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            position: 'relative',
            px: { xs: 2.5, sm: 4 },
            pr: { xs: 14, sm: 20 },
            pb: 2,
          }}
        >
          {subtitle}
        </Typography>
      )}

      <DialogContent
        sx={{ position: 'relative', pt: 0, px: { xs: 2.5, sm: 4 } }}
      >
        <Stack spacing={3} mt={1}>
          {withIcon && (
            <Box
              sx={{
                p: 2,
                borderRadius: '20px',
                bgcolor: '#F9EDFE',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {text.COMMON.PREVIEW_LABEL}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mt: 1, pl: { sm: 6 }, minWidth: 0 }}
              >
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: values.color
                        ? alpha(values.color, 0.16)
                        : 'background.paper',
                    }}
                  >
                    <CategoryIcon
                      icon={values.icon}
                      color={values.color}
                      fontSize="medium"
                    />
                  </Box>
                  <Box
                    aria-hidden
                    sx={{ position: 'absolute', top: -14, right: -14 }}
                  >
                    <Image src={linesDark} alt="" width={16} height={17} />
                  </Box>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={(t) => ({
                      fontFamily: t.typography.h6.fontFamily,
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: previewName ? 'text.primary' : 'text.disabled',
                    })}
                  >
                    {previewName || namePlaceholder}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {text.COMMON.PREVIEW_HINT}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Box>
            <Typography
              component="label"
              htmlFor={nameId}
              variant="body2"
              sx={labelSx}
              display="block"
            >
              {text.COMMON.NAME_LABEL}
            </Typography>
            <TextField
              id={nameId}
              placeholder={namePlaceholder}
              value={values.name}
              autoFocus
              fullWidth
              error={Boolean(error)}
              helperText={error}
              onChange={(e) => update({ name: e.target.value })}
              slotProps={{ htmlInput: { maxLength } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            />
          </Box>

          {palette && values.color && (
            <Box>
              <Typography variant="body2" sx={labelSx}>
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
              <Typography variant="body2" sx={labelSx}>
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

      <DialogActions
        sx={{
          position: 'relative',
          mx: { xs: 2.5, sm: 4 },
          px: 0,
          pt: 2,
          pb: 3,
          gap: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          '& > :not(style) ~ :not(style)': { ml: 0 },
        }}
      >
        <CustomButton
          variantType="outlined"
          onClick={onClose}
          sx={{
            minWidth: 120,
            py: 1,
            borderRadius: 999,
            borderColor: 'secondary.light',
            bgcolor: 'sidebar.activeBackground',
            '&:hover': { bgcolor: 'grey.100', borderColor: 'secondary.light' },
          }}
        >
          {text.COMMON.CANCEL}
        </CustomButton>
        <CustomButton
          variantType="primary"
          type="submit"
          disabled={submitting}
          loading={submitting}
          sx={{ minWidth: 120, py: 1, borderRadius: 999 }}
        >
          {submitLabel}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
