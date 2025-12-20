'use client';

import {
  Box,
  Divider,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { loginSchema, type LoginInput } from 'schemas';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface SignInFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signInPageText: Record<string, any>;
}

export default function SignInForm({ signInPageText }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const handleSignUpClick = () => {
    router.push('/register');
  };

  const handleGoogleSignInClick = () => {
    // TODO: call google sign in API
  };

  const onSubmit = async (data: LoginInput) => {
    console.log('Sign in data:', data);
    // TODO: call login API
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

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
        {signInPageText.FORM.SIGN_IN_TITLE}
      </Typography>

      <Stack spacing={2} mt={3}>
        <TextField
          label={signInPageText.FORM.EMAIL_FIELD}
          autoComplete="email"
          error={!!errors.email}
          helperText={
            errors.email &&
            signInPageText.FORM.SIGN_IN_FORM_VALIDATION.EMAIL.INVALID
          }
          {...register('email')}
        />

        <TextField
          label={signInPageText.FORM.PASSWORD_FIELD}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          error={!!errors.password}
          helperText={
            errors.password &&
            signInPageText.FORM.SIGN_IN_FORM_VALIDATION.PASSWORD.REQUIRED
          }
          {...register('password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <CustomButton
          type="submit"
          variantType="primary"
          loading={isSubmitting}
        >
          {signInPageText.FORM.SIGN_IN_BUTTON}
        </CustomButton>
      </Stack>

      <Divider sx={{ my: 6, height: 2, bgcolor: 'primary.light' }} />

      <Box textAlign="center">
        <Typography variant="h5" gutterBottom sx={{ my: 2, fontWeight: 600 }}>
          {signInPageText.NEW_USER_TITLE}
        </Typography>

        <CustomButton
          variantType="secondary"
          fullWidth
          onClick={handleSignUpClick}
        >
          {signInPageText.SIGN_UP_BUTTON}
        </CustomButton>
      </Box>

      <Divider sx={{ my: 6, height: 2, bgcolor: 'primary.light' }} />

      <Box textAlign="center">
        <CustomButton
          variantType="other"
          fullWidth
          onClick={handleGoogleSignInClick}
        >
          {signInPageText.CONTINUE_WITH_GOOGLE_BUTTON}
        </CustomButton>
      </Box>
    </Box>
  );
}
