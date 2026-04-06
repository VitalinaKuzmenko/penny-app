'use client';

import { Box, Typography, Stack, Link } from '@mui/material';
import CustomButton from '../ui/CustomButton/CustomButton';
import { useRouter } from 'next/navigation';
import dashboardPreviewImage from '../../../public/dashboard_preview.png';
import Image from 'next/image';

export default function HomeHeroSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const router = useRouter();

  console.log('homePageText', homePageText);

  const handleSignUpClick = () => {
    router.push('/register');
  };

  const handleUploadCsvClick = () => {
    router.push('/upload-csv');
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        alignItems: 'center',
        gap: { xs: 4, md: 8 },
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 0 },
      }}
    >
      {/* LEFT SIDE */}
      <Box>
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          {homePageText.HERO_SECTION.TITLE}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          {homePageText.HERO_SECTION.SUBTITLE}
        </Typography>

        <Stack direction="column" spacing={3} flexWrap="wrap">
          <CustomButton
            variantType="primary"
            onClick={handleUploadCsvClick}
            sx={{
              fontWeight: 600,
              fontSize: '30px',
              width: { xs: '100%', sm: '320px' },
              maxWidth: { xs: '100%', sm: '320px' },
              minWidth: { xs: '100%', sm: '320px' },
            }}
          >
            {homePageText.HERO_SECTION.BUTTONS.UPLOAD_CSV}
          </CustomButton>{' '}
          <CustomButton
            sx={{
              width: { xs: '100%', sm: '220px' },
              maxWidth: { xs: '100%', sm: '220px' },
              minWidth: { xs: '100%', sm: '220px' },
            }}
            variantType="secondary"
            onClick={handleSignUpClick}
          >
            {homePageText.HERO_SECTION.BUTTONS.CREATE_ACCOUNT}
          </CustomButton>
        </Stack>

        {/* Subtitle */}
        <Stack spacing={1} mb={5} mt={3} direction="row">
          <Typography variant="body2">
            {homePageText.HERO_SECTION.SUBTEXT}
          </Typography>
          <Link href="/signin" color="text.primary" variant="body2">
            {homePageText.HERO_SECTION.SIGN_IN_LINK}
          </Link>
        </Stack>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 250, sm: 300, md: 400, lg: 500 },
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 3,
          }}
        >
          <Image
            src={dashboardPreviewImage}
            alt="Penny dashboard preview"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 900px) 100vw, 50vw"
            priority
          />
        </Box>
      </Box>
    </Box>
  );
}
