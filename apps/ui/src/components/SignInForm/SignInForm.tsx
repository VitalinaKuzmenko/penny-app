'use client';

import { Box, Button, Divider, TextField, Typography, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, type LoginInput } from 'schemas';

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    console.log('Sign in data:', data);
    // TODO: call login API
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
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
      <Stack spacing={2} mt={2}>
        <TextField
          label="Email"
          fullWidth
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
        >
          Sign In
        </Button>
      </Stack>

      {/* New User Section */}
      <Divider sx={{ my: 3 }} />

      <Box textAlign="center">
        <Typography
          variant="h5"
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
