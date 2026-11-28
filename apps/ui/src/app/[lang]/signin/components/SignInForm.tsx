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
  Link,
} from '@mui/material';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import LoginRounded from '@mui/icons-material/LoginRounded';
import Image from 'next/image';
import logo from '../../../../../public/Penny_logo_transparent.png';
import scene from '../../../../../public/books.png';
import heart from '../../../../../public/heart_2.png';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { zodResolver } from '@hookform/resolvers/zod';

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
    <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
      {/* logo is tinted plum with a mask: the shared logo file is cream-coloured */}
      <Box
        component="a"
        href="/"
        aria-label="Penny"
        sx={{
          display: 'block',
          width: 130,
          aspectRatio: `${logo.width} / ${logo.height}`,
          mx: 'auto',
          mb: 1.5,
          bgcolor: 'secondary.main',
          maskImage: `url(${logo.src})`,
          WebkitMaskImage: `url(${logo.src})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          mb: 2,
          p: { xs: 2.5, sm: 4 },
          borderRadius: '28px',
          boxShadow: '0 8px 32px rgba(83, 36, 70, 0.1)',
          bgcolor: '#FFFBF9',
          // lavender, rounded inputs as in the design
          '& .MuiOutlinedInput-root': {
            bgcolor: '#F7EEFD',
            borderRadius: '14px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#DCC8F0',
            },
          },
        }}
      >
        <Image
          src={scene}
          alt=""
          aria-hidden
          priority
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            // the artwork has a faint backdrop; fading its edges blends it into the card
            maskImage:
              'radial-gradient(ellipse at center, #000 62%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, #000 62%, transparent 100%)',
          }}
        />

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'secondary.main',
              fontSize: { xs: '1.7rem', sm: '2.1rem' },
            }}
          >
            {signInPageText.FORM.SIGN_IN_TITLE}{' '}
            <Image
              src={heart}
              alt=""
              aria-hidden
              width={90}
              height={60}
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                margin: '-14px -26px -14px -22px',
              }}
            />
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {signInPageText.FORM.SUBTITLE}
          </Typography>
        </Box>

        <Stack spacing={2} mt={3}>
          <TextField
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
            label={signInPageText.FORM.PASSWORD_FIELD}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={!!errors.password}
            helperText={
              errors.password && errors.password.message
                ? getTranslatedError(
                    errors.password.message,
                    signInPageText.FORM,
                  )
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
            sx={{ py: 1.4, fontSize: '1.1rem', borderRadius: '14px' }}
          >
            {signInPageText.FORM.SIGN_IN_BUTTON}
          </CustomButton>
        </Stack>

        <Divider
          sx={{
            my: 3,
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
            py: 1.1,
            borderRadius: '14px',
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
          sx={{ mt: 3 }}
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
      </Box>

      <ErrorBanner error={error} onClose={handleCloseError} colorMode="color" />
    </Box>
  );
}
