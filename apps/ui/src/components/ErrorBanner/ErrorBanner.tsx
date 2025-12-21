// components/ui/Banner.tsx
'use client';

import { FC, useState } from 'react';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UiError } from '@/types/interfaces';

interface ErrorBannerProps {
  error: UiError | null;
  onClose?: () => void;
  colorMode?: 'light' | 'color';
}

const ErrorBanner: FC<ErrorBannerProps> = ({
  error,
  onClose,
  colorMode = 'light',
}) => {
  const [open, setOpen] = useState<boolean>(!!error);

  if (!error) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Collapse in={open}>
      {colorMode === 'light' && (
        <Alert
          severity={error.severity ?? 'error'}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {error.title && <AlertTitle>{error.title}</AlertTitle>}
          {error.message}
        </Alert>
      )}
      {colorMode === 'color' && (
        <Alert
          severity={error.severity ?? 'error'}
          sx={{
            mb: 2,
            bgcolor:
              error.severity === 'error'
                ? (theme) => theme.palette.error.light
                : error.severity === 'warning'
                  ? (theme) => theme.palette.warning.light
                  : undefined,
            color:
              error.severity === 'error'
                ? (theme) => theme.palette.error.dark
                : error.severity === 'warning'
                  ? (theme) => theme.palette.warning.dark
                  : undefined,
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error.title && <AlertTitle>{error.title}</AlertTitle>}
          {error.message}
        </Alert>
      )}
    </Collapse>
  );
};

export default ErrorBanner;
