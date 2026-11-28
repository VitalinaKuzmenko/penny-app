'use client';

import { useState } from 'react';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import Person from '@mui/icons-material/Person';
import MailOutline from '@mui/icons-material/MailOutline';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import Image from 'next/image';
import PageHero from '@/components/PageHero/PageHero';
import sparks from '../../../../../public/icon_right_trans.png';
import Spinner from '@/components/ui/Spinner/Spinner';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { useRouter } from 'next/navigation';
import { UiError } from '@/types/interfaces';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { useAuth } from '@/providers/AuthProvider';

interface ProfileClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profilePageText: Record<string, any>;
}

export default function ProfileClientSection({
  profilePageText,
}: ProfileClientProps) {
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
        <CustomButton variantType="secondary" onClick={handleSignInClick}>
          {profilePageText.SIGN_IN_BUTTON}
        </CustomButton>
      </Box>
    );

  return (
    <Box>
      <PageHero
        title={profilePageText.TITLE}
        subtitle={profilePageText.SUBTITLE}
      />

      <Paper
        sx={{
          mt: { xs: 3, md: 6 },
          width: '100%',
          maxWidth: 560,
          boxSizing: 'border-box',
          overflow: 'hidden',
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: '24px',
          bgcolor: '#FFFBF9',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          // phones: stretch children to the card width so long emails wrap
          // instead of pushing the card wider than the screen
          alignItems={{ xs: 'center', sm: 'center' }}
          sx={{
            textAlign: { xs: 'center', sm: 'left' },
            minWidth: 0,
            '& > *': { maxWidth: '100%' },
          }}
        >
          {/* wrapper so the little spark marks can sit at the avatar's corner */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box
              aria-hidden
              sx={{
                width: 96,
                height: 96,
                flexShrink: 0,
                borderRadius: '50%',
                bgcolor: '#EEDDF8',
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Person sx={{ fontSize: 56 }} />
            </Box>
            <Image
              src={sparks}
              alt=""
              aria-hidden
              width={100}
              height={100}
              style={{
                position: 'absolute',
                top: -54,
                right: -56,
                pointerEvents: 'none',
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            <Typography
              variant="h5"
              component="p"
              sx={{ color: 'secondary.main', overflowWrap: 'anywhere' }}
            >
              {user.userName} {user.userSurname}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              sx={{ mt: 0.5, color: 'text.secondary', minWidth: 0 }}
            >
              <MailOutline fontSize="small" sx={{ flexShrink: 0 }} />
              <Typography sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>
                {user.userEmail}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LogoutRounded />}
            onClick={handleSignOut}
            sx={{
              py: 1.25,
              px: 5,
              fontSize: '1.1rem',
              borderRadius: '14px',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {profilePageText.SIGN_OUT}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <ErrorBanner
          error={error}
          onClose={() => setError(null)}
          colorMode="color"
        />
      </Box>
    </Box>
  );
}
