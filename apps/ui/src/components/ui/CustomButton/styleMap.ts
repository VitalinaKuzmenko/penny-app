import { SxProps, Theme } from '@mui/material';

export const styleMap: Record<
  'primary' | 'secondary' | 'other',
  SxProps<Theme>
> = {
  primary: {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    fontWeight: 600,
    fontSize: '16px',
    borderRadius: 2, // rounded corners
    py: 1.5, // vertical padding
    px: 3, // horizontal padding
    boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    textTransform: 'none', // disable uppercase
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'primary.light',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  secondary: {
    border: '2px solid',
    borderColor: 'primary.main',
    color: 'primary.main',
    fontWeight: 600,
    fontSize: '16px',
    borderRadius: 2,
    py: 1.5,
    px: 3,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'primary.dark',
      color: 'primary.contrastText',
      borderColor: 'primary.dark',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  other: {
    border: '2px solid',
    borderColor: 'secondary.main',
    color: 'secondary.main',
    fontWeight: 600,
    fontSize: '16px',
    borderRadius: 2,
    py: 1.5,
    px: 3,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'secondary.light',
      color: 'secondary.contrastText',
      borderColor: 'secondary.dark',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
};
