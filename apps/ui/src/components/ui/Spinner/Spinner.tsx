'use client';

import { CircularProgress, Box } from '@mui/material';

interface SpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

export default function Spinner({
  size = 40,
  fullScreen = false,
}: SpinnerProps) {
  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <CircularProgress size={size} />
    </Box>
  );
}
