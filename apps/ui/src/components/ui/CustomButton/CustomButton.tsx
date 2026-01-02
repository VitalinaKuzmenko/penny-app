'use client';

import { Button, ButtonProps, CircularProgress } from '@mui/material';
import React from 'react';
import { styleMap, sizeMap } from './styleMap';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  variantType?:
    | 'primary'
    | 'secondary'
    | 'secondary_transparent'
    | 'secondary_full';
  buttonSize?: 'small' | 'medium' | 'big-medium' | 'large';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading = false,
  variantType = 'primary',
  buttonSize = 'medium',
  fullWidth = false,
  sx,
  disabled,
  ...rest
}) => {
  // Merge the variant + size + user-provided sx
  const mergedSx = {
    ...(styleMap[variantType] || {}),
    ...(sizeMap[buttonSize] || {}),
    ...(sx || {}),
  };

  return (
    <Button
      {...rest}
      // size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      endIcon={
        loading ? <CircularProgress size={20} color="inherit" /> : undefined
      }
      sx={mergedSx}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
