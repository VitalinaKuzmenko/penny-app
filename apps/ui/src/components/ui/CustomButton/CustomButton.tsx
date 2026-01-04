'use client';

import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  variantType?: 'primary' | 'secondary' | 'text' | 'contained' | 'outlined';
  disabledStyling?: boolean;
}

const variantMap: Record<
  NonNullable<CustomButtonProps['variantType']>,
  Pick<ButtonProps, 'variant' | 'color'>
> = {
  primary: {
    variant: 'contained',
    color: 'primary',
  },
  secondary: {
    variant: 'outlined',
    color: 'primary',
  },
  text: {
    variant: 'text',
    color: 'primary',
  },
  contained: {
    variant: 'contained',
    color: 'secondary',
  },
  outlined: {
    variant: 'outlined',
    color: 'secondary',
  },
};

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading = false,
  disabled,
  disabledStyling = false,
  variantType = 'primary',
  sx,
  ...rest
}) => {
  const muiVariantProps = variantMap[variantType];

  const disabledSx =
    disabledStyling || loading
      ? {
          '&.Mui-disabled': {
            bgcolor: 'grey.300',
            borderColor: 'grey.400',
            color: 'grey.500',
            opacity: 0.7,
            cursor: 'not-allowed',
          },
        }
      : undefined;

  return (
    <Button
      {...muiVariantProps}
      {...rest}
      disabled={disabled || loading}
      sx={{
        ...disabledSx,
        ...sx, // allow local overrides if needed
      }}
      endIcon={
        loading ? <CircularProgress size={18} color="inherit" /> : undefined
      }
    >
      {children}
    </Button>
  );
};

export default CustomButton;
