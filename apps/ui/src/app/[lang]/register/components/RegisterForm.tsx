/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { registerUser } from '@/requests/registerUser';
import { getNestedDict, getTranslatedError } from '@/utils/getNestedDict';
import { UiError } from '@/types/interfaces';
import { useAuth } from '@/providers/AuthProvider';
import GoogleIcon from '@mui/icons-material/Google';
import {
  RegisterFormInput,
  registerFormSchema,
} from '@/ui-schemas/registerForm.schema';

interface RegisterPageProps {
  registerPageText: Record<string, any>;
}

// extend ONLY on the client

export default function RegisterPage({ registerPageText }: RegisterPageProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<UiError | null>(null);

  const { refetchUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormInput) => {
    try {
      const { confirmPassword, ...payload } = data;

      await registerUser(payload);

      await refetchUser();
      router.push('/');
    } catch (err: any) {
      if (err.data?.field && err.data?.code) {
        const translatedMessage = getNestedDict(
          registerPageText.FORM.ERRORS,
          err.data.code.toUpperCase(),
        );

        setFormError(err.data.field, {
          type: 'server',
          message: translatedMessage ?? 'Unknown error',
        });
        return;
      }

      setError({
        title: registerPageText.FORM.ERRORS.GENERAL.TITLE,
        message: registerPageText.FORM.ERRORS.GENERAL.MESSAGE,
      });
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleSignInClick = () => {
    router.push('/signin');
  };

  const handleGoogleSignInClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`;
  };

  return (
    <Box>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          minWidth: { xs: '100%', sm: 550 },
          maxWidth: { xs: '100%', sm: 550 },
          mx: 'auto',
          mb: 2,
          p: 5,
          borderRadius: 5,
          boxShadow: 10,
          bgcolor: 'background.paper',
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {registerPageText.FORM.CREATE_ACCOUNT_TITLE}
        </Typography>

        {/* Subtitle */}
        <Stack spacing={1} alignItems="center" mb={5} mt={3}>
          <Typography variant="body2" align="center">
            {registerPageText.FORM.ALREADY_HAVE_ACCOUNT}
          </Typography>
          <CustomButton variantType="secondary" onClick={handleSignInClick}>
            {registerPageText.FORM.SIGN_IN_BUTTON}
          </CustomButton>
        </Stack>

        {/* Form Fields */}
        <Stack spacing={2}>
          <TextField
            label={registerPageText.FORM.EMAIL_FIELD}
            autoComplete="email"
            error={!!errors.email}
            helperText={
              errors.email && errors.email.message
                ? getTranslatedError(
                    errors.email.message,
                    registerPageText.FORM,
                  )
                : ''
            }
            {...register('email')}
          />

          <TextField
            label={registerPageText.FORM.PASSWORD_FIELD}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.password}
            helperText={
              errors.password && errors.password.message
                ? getTranslatedError(
                    errors.password.message,
                    registerPageText.FORM,
                  )
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

          <TextField
            label={registerPageText.FORM.CONFIRM_PASSWORD_FIELD}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={
              errors.confirmPassword && errors.confirmPassword.message
                ? getTranslatedError(
                    errors.confirmPassword.message,
                    registerPageText.FORM,
                  )
                : ''
            }
            {...register('confirmPassword')}
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

          <TextField
            label={registerPageText.FORM.USERNAME_FIELD}
            autoComplete="username"
            error={!!errors.userName}
            helperText={
              errors.userName && errors.userName.message
                ? getTranslatedError(
                    errors.userName.message,
                    registerPageText.FORM,
                  )
                : ''
            }
            {...register('userName')}
          />

          <TextField
            label={registerPageText.FORM.USER_SURNAME_FIELD}
            autoComplete="family-name"
            error={!!errors.userSurname}
            helperText={
              errors.userSurname && errors.userSurname.message
                ? getTranslatedError(
                    errors.userSurname.message,
                    registerPageText.FORM,
                  )
                : ''
            }
            {...register('userSurname')}
          />

          {/* Submit Button */}
          <CustomButton
            type="submit"
            variantType="primary"
            fullWidth
            loading={isSubmitting}
          >
            {registerPageText.FORM.CREATE_ACCOUNT_BUTTON}
          </CustomButton>

          <Box sx={{ my: 4 }}>
            <Divider sx={{ my: 3, height: 2, bgcolor: 'primary.light' }} />
          </Box>

          <Box textAlign="center">
            <CustomButton
              variantType="outlined"
              fullWidth
              onClick={handleGoogleSignInClick}
              startIcon={<GoogleIcon />}
            >
              {registerPageText.CONTINUE_WITH_GOOGLE_BUTTON}
            </CustomButton>
          </Box>
        </Stack>
      </Box>
      <ErrorBanner
        error={error}
        onClose={() => setError(null)}
        colorMode="color"
      />
    </Box>
  );
}
