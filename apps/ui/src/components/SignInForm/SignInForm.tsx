/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { getNestedDict } from '@/utils/getNestedDict';
import { loginUser } from '@/api/lib/login';
import { UiError } from '@/types/interfaces';
import ErrorBanner from '../ErrorBanner/ErrorBanner';

interface SignInFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signInPageText: Record<string, any>;
}

export default function SignInForm({ signInPageText }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<UiError | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError: setFormError,
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
    try {
      await loginUser(data);

      router.push('/');
    } catch (err: any) {
      if (err.data?.field && err.data?.code) {
        const translatedMessage = getNestedDict(
          signInPageText.FORM.ERRORS,
          err.data.code.toUpperCase(),
        );

        setFormError(err.data.field, {
          type: 'server',
          message: translatedMessage ?? 'Unknown error',
        });
        return;
      }

      setError({
        title: signInPageText.FORM.ERRORS.GENERAL.TITLE,
        message: signInPageText.FORM.ERRORS.GENERAL.MESSAGE,
      });
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <Box>
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
              errors.password?.message
                ? signInPageText.FORM.SIGN_IN_FORM_VALIDATION.PASSWORD[
                    errors.password.message.split('.').pop()!.toUpperCase()
                  ]
                : ''
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

      <ErrorBanner
        error={error}
        onClose={() => setError(null)}
        colorMode="color"
      />
    </Box>
  );
}
