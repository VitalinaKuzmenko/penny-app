'use client';

import { Box, Button, Divider, TextField, Typography, Stack } from '@mui/material';

export default function SignInForm() {
  return (
    <Box
      sx={{
        width: '100%',
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper',
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
      >
        Sign In
      </Typography>

      {/* Sign In Form */}
      <Stack
        spacing={2}
        mt={2}
      >
        <TextField
          label="Username"
          fullWidth
          autoComplete="username"
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          autoComplete="current-password"
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
        >
          Sign in
        </Button>
      </Stack>

      {/* New User Section */}
      <Divider sx={{ my: 3 }} />

      <Box textAlign="center">
        <Typography
          variant="h5"
          align="center"
          gutterBottom
        >
          New User
        </Typography>

        <Button
          variant="outlined"
          fullWidth
        >
          Create Account
        </Button>
      </Box>

      {/* Continue with Google */}
      <Divider sx={{ my: 3 }} />

      <Button
        variant="outlined"
        fullWidth
      >
        Continue with Google
      </Button>
    </Box>
  );
}
