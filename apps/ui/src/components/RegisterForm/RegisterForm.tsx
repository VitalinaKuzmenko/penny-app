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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { registerSchema, type RegisterInput } from 'schemas';

interface RegisterPageProps {
  registerPageText: Record<string, any>;
}

export default function RegisterPage({ registerPageText }: RegisterPageProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log('Register data:', data);
    // TODO: call register API
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleSignInClick = () => {
    router.push('/signin');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 450,
        mx: 'auto',
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
        <CustomButton
          variantType="secondary"
          size="small"
          onClick={handleSignInClick}
        >
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
            errors.email &&
            registerPageText.FORM.REGISTER_FORM_VALIDATION.EMAIL.INVALID
          }
          {...register('email')}
        />

        <TextField
          label={registerPageText.FORM.PASSWORD_FIELD}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          error={!!errors.password}
          helperText={
            errors.password?.message
              ? registerPageText.FORM.REGISTER_FORM_VALIDATION.PASSWORD[
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

        <TextField
          label={registerPageText.FORM.USERNAME_FIELD}
          autoComplete="username"
          error={!!errors.userName}
          helperText={
            errors.userName &&
            registerPageText.FORM.REGISTER_FORM_VALIDATION.USERNAME.REQUIRED
          }
          {...register('userName')}
        />

        <TextField
          label={registerPageText.FORM.USER_SURNAME_FIELD}
          autoComplete="family-name"
          error={!!errors.userSurname}
          helperText={
            errors.userSurname &&
            registerPageText.FORM.REGISTER_FORM_VALIDATION.USER_SURNAME.REQUIRED
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
      </Stack>
    </Box>
  );
}
