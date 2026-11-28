/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Divider,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import LoginRounded from '@mui/icons-material/LoginRounded';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { zodResolver } from '@hookform/resolvers/zod';

import AuthCard from '@/components/AuthCard/AuthCard';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { LoginSchema, type LoginInput } from 'schemas';

import { getNestedDict, getTranslatedError } from '@/utils/getNestedDict';
import { loginUser } from '@/requests/loginUser';
import { UiError } from '@/types/interfaces';

interface SignInFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signInPageText: Record<string, any>;
}

export default function SignInForm({ signInPageText }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<UiError | null>(null);
  // the ?error= value the user closed, so a different OAuth error still shows
  const [dismissedOauthError, setDismissedOauthError] = useState<string | null>(
    null,
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const { refetchUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const oauthError = searchParams.get('error');
  const oauthUiError: UiError | null =
    oauthError && oauthError !== dismissedOauthError
      ? {
          title: signInPageText.FORM.ERRORS.GENERAL.TITLE,
          message:
            getNestedDict(
              signInPageText.FORM.ERRORS,
              oauthError.toUpperCase(),
            ) ?? signInPageText.FORM.ERRORS.GENERAL.MESSAGE,
        }
      : null;
  const error = submitError ?? oauthUiError;

  const handleCloseError = () => {
    setSubmitError(null);
    setDismissedOauthError(oauthError);
  };

  const handleSignUpClick = () => {
    router.push('/register');
  };

  const handleGoogleSignInClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`;
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginUser(data);
      await refetchUser();
      router.push('/pennys-view');
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

      setSubmitError({
        title: signInPageText.FORM.ERRORS.GENERAL.TITLE,
        message: signInPageText.FORM.ERRORS.GENERAL.MESSAGE,
      });
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <AuthCard
      title={signInPageText.FORM.SIGN_IN_TITLE}
      subtitle={signInPageText.FORM.SUBTITLE}
      onSubmit={handleSubmit(onSubmit)}
      below={
        <ErrorBanner
          error={error}
          onClose={handleCloseError}
          colorMode="color"
        />
      }
    >
      <Stack spacing={1.5} mt={2}>
        <TextField
          size="small"
          label={signInPageText.FORM.EMAIL_FIELD}
          autoComplete="email"
          error={!!errors.email}
          helperText={
            errors.email && errors.email.message
              ? getTranslatedError(errors.email.message, signInPageText.FORM)
              : ''
          }
          {...register('email')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutline sx={{ color: 'secondary.main' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          size="small"
          label={signInPageText.FORM.PASSWORD_FIELD}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          error={!!errors.password}
          helperText={
            errors.password && errors.password.message
              ? getTranslatedError(errors.password.message, signInPageText.FORM)
              : ''
          }
          {...register('password')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: 'secondary.main' }} />
              </InputAdornment>
            ),
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
          color="secondary"
          loading={isSubmitting}
          startIcon={<LoginRounded />}
          sx={{ py: 1, fontSize: '1rem', borderRadius: '12px' }}
        >
          {signInPageText.FORM.SIGN_IN_BUTTON}
        </CustomButton>
      </Stack>

      <Divider
        sx={{
          my: 1.5,
          color: 'text.secondary',
          '&::before, &::after': { borderColor: '#DCC8F0' },
        }}
      >
        {signInPageText.FORM.OR}
      </Divider>

      <CustomButton
        variantType="outlined"
        color="secondary"
        fullWidth
        onClick={handleGoogleSignInClick}
        startIcon={<GoogleIcon />}
        sx={{
          py: 0.75,
          borderRadius: '12px',
          bgcolor: '#F7EEFD',
          borderColor: '#DCC8F0',
          color: 'text.primary',
          '&:hover': { bgcolor: '#F1E4FA', borderColor: '#C9A8E6' },
        }}
      >
        {signInPageText.CONTINUE_WITH_GOOGLE_BUTTON}
      </CustomButton>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        sx={{ mt: 1.5 }}
      >
        <Typography color="text.secondary">
          {signInPageText.NEW_USER_TITLE}
        </Typography>
        <Link
          component="button"
          type="button"
          underline="always"
          onClick={handleSignUpClick}
          sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '1rem' }}
        >
          {signInPageText.SIGN_UP_BUTTON}
        </Link>
      </Stack>
    </AuthCard>
  );
}
