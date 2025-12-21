'use client';

import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#041646',
      light: '#3B4A8A',
      dark: '#020B2D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#f36919ff',
      light: '#ffaf72ff',
      dark: '#C2410C',
      contrastText: '#1F2937',
    },
    success: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#047857',
    },
    warning: {
      main: '#F59E0B',
      light: '#f6cb76ff',
      dark: '#B45309',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#B91C1C',
    },
    info: {
      main: '#38BDF8',
    },
    background: {
      default: '#D1D5DB',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
