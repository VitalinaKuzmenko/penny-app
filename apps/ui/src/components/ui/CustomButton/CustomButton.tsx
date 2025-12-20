'use client';

import { Button, ButtonProps, CircularProgress } from '@mui/material';
import React from 'react';
import { styleMap } from './styleMap';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  variantType?: 'primary' | 'secondary' | 'other';
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  loading = false,
  children,
  disabled,
  variantType = 'primary',
  fullWidth = false,

  ...rest
}) => {
  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      endIcon={
        loading ? <CircularProgress size={20} color="inherit" /> : undefined
      }
      sx={styleMap[variantType]}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
