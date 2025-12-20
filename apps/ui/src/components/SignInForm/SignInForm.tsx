'use client';

import { Box, Divider, TextField, Typography, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
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
        mx: 'auto',
        p: 5,
        borderRadius: 5,
        boxShadow: 10,
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Sign In
      </Typography>

      <Stack spacing={2} mt={3}>
        <TextField
          label="Email"
          // fullWidth
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <CustomButton
          type="submit"
          variantType="primary"
          loading={isSubmitting}
        >
          Sign In
        </CustomButton>
      </Stack>

      <Divider sx={{ my: 6, height: 2, bgcolor: 'primary.light' }} />

      <Box textAlign="center">
        <Typography variant="h5" gutterBottom sx={{ my: 2, fontWeight: 600 }}>
          New User
        </Typography>

        <CustomButton variantType="secondary" fullWidth>
          Create Account
        </CustomButton>
      </Box>

      <Divider sx={{ my: 6, height: 2, bgcolor: 'primary.light' }} />

      <Box textAlign="center">
        <CustomButton variantType="other" fullWidth>
          Continue with Google
        </CustomButton>
      </Box>
    </Box>
  );
}
