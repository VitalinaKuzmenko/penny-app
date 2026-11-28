/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { ReactNode, useState } from 'react';
import {
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
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined';
import AuthCard from '@/components/AuthCard/AuthCard';
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
      router.push('/pennys-view');
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

  const adornment = (icon: ReactNode) => (
    <InputAdornment position="start">{icon}</InputAdornment>
  );
  const toggle = (
    <InputAdornment position="end">
      <IconButton onClick={handleTogglePassword} edge="end">
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );
  const iconSx = { color: 'secondary.main' };

  return (
    <AuthCard
      title={registerPageText.FORM.CREATE_ACCOUNT_TITLE}
      subtitle={registerPageText.FORM.SUBTITLE}
      onSubmit={handleSubmit(onSubmit)}
      below={
        <ErrorBanner
          error={error}
          onClose={() => setError(null)}
          colorMode="color"
        />
      }
    >
      {/* Already have an account */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        sx={{ mt: 1, mb: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          {registerPageText.FORM.ALREADY_HAVE_ACCOUNT}
        </Typography>
        <CustomButton
          variantType="outlined"
          color="secondary"
          size="small"
          onClick={handleSignInClick}
          sx={{
            px: 2,
            borderRadius: '12px',
            fontWeight: 800,
            bgcolor: '#F7EEFD',
            borderColor: '#DCC8F0',
            '&:hover': { bgcolor: '#F1E4FA', borderColor: '#C9A8E6' },
          }}
        >
          {registerPageText.FORM.SIGN_IN_BUTTON}
        </CustomButton>
      </Stack>

      {/* Form Fields */}
      <Stack spacing={1.5}>
        <TextField
          size="small"
          label={registerPageText.FORM.EMAIL_FIELD}
          autoComplete="email"
          error={!!errors.email}
          helperText={
            errors.email && errors.email.message
              ? getTranslatedError(errors.email.message, registerPageText.FORM)
              : ''
          }
          {...register('email')}
          InputProps={{
            startAdornment: adornment(<MailOutline sx={iconSx} />),
          }}
        />

        <TextField
          size="small"
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
            startAdornment: adornment(<LockOutlined sx={iconSx} />),
            endAdornment: toggle,
          }}
        />

        <TextField
          size="small"
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
            startAdornment: adornment(<LockOutlined sx={iconSx} />),
            endAdornment: toggle,
          }}
        />

        <TextField
          size="small"
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
          InputProps={{
            startAdornment: adornment(<PersonOutline sx={iconSx} />),
          }}
        />

        <TextField
          size="small"
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
          InputProps={{
            startAdornment: adornment(<PersonOutline sx={iconSx} />),
          }}
        />

        {/* Submit Button */}
        <CustomButton
          type="submit"
          variantType="primary"
          color="secondary"
          fullWidth
          loading={isSubmitting}
          startIcon={<PersonAddAltOutlined />}
          sx={{ py: 1, fontSize: '1rem', borderRadius: '12px' }}
        >
          {registerPageText.FORM.CREATE_ACCOUNT_BUTTON}
        </CustomButton>
      </Stack>

      <Divider
        sx={{
          my: 1.5,
          color: 'text.secondary',
          '&::before, &::after': { borderColor: '#DCC8F0' },
        }}
      >
        {registerPageText.FORM.OR}
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
        {registerPageText.CONTINUE_WITH_GOOGLE_BUTTON}
      </CustomButton>
    </AuthCard>
  );
}
