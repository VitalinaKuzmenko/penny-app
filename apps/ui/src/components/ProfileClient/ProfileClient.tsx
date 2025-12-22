'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import Spinner from '@/components/ui/Spinner/Spinner';
import CustomButton from '../ui/CustomButton/CustomButton';
import { useRouter } from 'next/navigation';
import { UiError } from '@/types/interfaces';
import ErrorBanner from '../ErrorBanner/ErrorBanner';
import { useAuth } from '@/providers/AuthProvider';

interface ProfileClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profilePageText: Record<string, any>;
}

export default function ProfileClient({ profilePageText }: ProfileClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const { user, setUser } = useAuth();

  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/logout`,
      {
        method: 'POST',
        credentials: 'include',
      },
    );

    if (!res.ok) {
      setError({
        title: profilePageText.ERRORS.SIGN_OUT.TITLE,
        message: profilePageText.ERRORS.SIGN_OUT.MESSAGE,
        severity: 'error',
      });
      setLoading(false);
      return;
    }

    setLoading(false);

    router.push('/');
    setUser(null);
  };

  const handleSignInClick = () => {
    router.push('/signin');
  };

  if (loading) return <Spinner fullScreen />;

  if (!user)
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="20px"
        mt={5}
      >
        <Typography align="center" mt={5}>
          {profilePageText.NOT_SIGNED_IN}
        </Typography>
        <CustomButton
          variantType="secondary"
          size="small"
          onClick={handleSignInClick}
        >
          {profilePageText.SIGN_IN_BUTTON}
        </CustomButton>
      </Box>
    );

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      <Box display="flex" justifyContent="center" mt={5}>
        <Card sx={{ width: '100%', p: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {profilePageText.TITLE}
            </Typography>
            <Typography>
              <strong>{profilePageText.NAME}:</strong> {user.userName}{' '}
              {user.userSurname}
            </Typography>
            <Typography>
              <strong>{profilePageText.EMAIL}:</strong> {user.userEmail}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={handleSignOut}
            >
              {profilePageText.SIGN_OUT}
            </Button>
          </CardContent>
        </Card>
      </Box>

      <ErrorBanner
        error={error}
        onClose={() => setError(null)}
        colorMode="color"
      />
    </Box>
  );
}
