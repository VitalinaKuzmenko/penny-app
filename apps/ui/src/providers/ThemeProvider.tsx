'use client';

import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

const plum = '#592148';
const plumDark = '#3A1832';
const radius = 16;
const softShadow = '0 4px 20px rgba(83, 36, 70, 0.08)';
const hoverShadow = '0 8px 28px rgba(83, 36, 70, 0.14)';
const headingFont =
  '"Fraunces", "Playfair Display", "Iowan Old Style", Georgia, serif';
const bodyFont =
  '"Nunito", "Quicksand", ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const headingStyle = {
  fontFamily: headingFont,
  fontWeight: 700,
  letterSpacing: '-0.01em',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F2616F', // coral
      light: '#FF8A94',
      dark: '#D94656',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B2150', // plum
      light: '#B79AD9', // lavender
      dark: plumDark,
      contrastText: '#FFFFFF',
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
      default: '#FEF3F0', // warm cream
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3A1832',
      secondary: '#7A6573',
    },
    divider: 'rgba(83, 36, 70, 0.12)',
    grey: {
      50: '#FAF6F2',
      100: '#F5EEF3',
      200: '#EADFE6',
      300: '#D9CBD3',
      400: '#B3A2AD',
      500: '#85727D',
      600: '#65535D',
      700: '#4A3A44',
      800: '#33252E',
      900: '#1F1419',
    },
    chart: {
      income: '#10B981', // same as success.main
      expense: '#EF4444', // same as error.main
      savings: '#38BDF8', // same as info.main
      neutral: '#E5E7EB',
    },
    sidebar: {
      background: plum,
      text: '#F6E9F1',
      mutedText: 'rgba(246, 233, 241, 0.72)',
      hover: 'rgba(255, 255, 255, 0.08)',
      activeBackground: '#F1DDFD', // lavender
      activeText: plumDark,
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: bodyFont,
    h1: headingStyle,
    h2: headingStyle,
    h3: headingStyle,
    h4: headingStyle,
    h5: headingStyle,
    h6: { ...headingStyle, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 20px',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          boxShadow: '0 4px 14px rgba(242, 97, 111, 0.35)',
          '&:hover': { boxShadow: '0 6px 18px rgba(242, 97, 111, 0.45)' },
        },
        outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: radius },
        elevation1: { boxShadow: softShadow },
        elevation2: { boxShadow: softShadow },
        elevation3: { boxShadow: hoverShadow },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: { root: { borderRadius: 20 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 24 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: plum,
          backgroundColor: '#F5EEF3',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: plumDark, borderRadius: 8 },
        arrow: { color: plumDark },
      },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 14 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
        // brighter than MUI's default pale warning so it stands out on cream
        standardWarning: {
          backgroundColor: '#FFE2B8',
          color: '#7A4100',
          border: '1px solid #F7B04D',
          '& .MuiAlert-icon': { color: '#E07B00' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3 },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } },
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

declare module '@mui/material/styles' {
  interface Palette {
    chart: {
      income: string;
      expense: string;
      savings: string;
      neutral: string;
    };
    sidebar: SidebarColors;
  }
  interface PaletteOptions {
    chart?: {
      income?: string;
      expense?: string;
      savings?: string;
      neutral?: string;
    };
    sidebar?: Partial<SidebarColors>;
  }
  interface SidebarColors {
    background: string;
    text: string;
    mutedText: string;
    hover: string;
    activeBackground: string;
    activeText: string;
  }
}
