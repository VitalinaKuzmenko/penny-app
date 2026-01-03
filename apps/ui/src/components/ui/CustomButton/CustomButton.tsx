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
  disabledStyling?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading = false,
  variantType = 'primary',
  buttonSize = 'medium',
  fullWidth = false,
  sx,
  disabledStyling = false,
  ...rest
}) => {
  // Merge the variant + size + user-provided sx
  const baseSx = {
    ...(styleMap[variantType] || {}),
    ...(sizeMap[buttonSize] || {}),
    ...(sx || {}),
  };

  // Custom "disabled look" styles
  const disabledSx =
    disabledStyling || loading
      ? {
          bgcolor: 'grey.300',
          border: '2px solid',
          borderColor: 'grey.400',
          color: 'grey.500',
          opacity: 0.7,
          boxShadow: 'none',
          cursor: 'not-allowed',
          '&:hover': {
            bgcolor: 'grey.300', // prevent hover change
            boxShadow: 'none',
          },
        }
      : {};

  const mergedSx = {
    ...baseSx,
    ...disabledSx,
  };

  return (
    <Button
      {...rest}
      // size={size}
      fullWidth={fullWidth}
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
