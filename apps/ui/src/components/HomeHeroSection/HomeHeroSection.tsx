'use client';

import { Box, Typography, Stack, Link } from '@mui/material';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import CustomButton from '../ui/CustomButton/CustomButton';
import HomeCheckList from '../HomeCheckList/HomeCheckList';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import heroPreview from '../../../public/home_page1.png';
import heart from '../../../public/heart_2.png';

interface HomeHeroSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}

export default function HomeHeroSection({
  homePageText,
}: HomeHeroSectionProps) {
  const router = useRouter();
  const text = homePageText.HERO_SECTION;

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
        gridTemplateColumns: {
          xs: '1fr',
          lg: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
        },
        alignItems: 'center',
        gap: { xs: 3, lg: 4 },
        py: { xs: 1, md: 2 },
        textAlign: { xs: 'center', lg: 'left' },
      }}
    >
      <Box>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: 'secondary.main',
            mb: 2,
            fontSize: { xs: '2.1rem', md: '2.9rem' },
            lineHeight: 1.15,
          }}
        >
          {text.TITLE}{' '}
          {/* the artwork has empty margins; negative margins trim them so the
              heart sits next to the title */}
          <Image
            src={heart}
            alt=""
            aria-hidden
            width={156}
            height={104}
            style={{
              display: 'inline-block',
              verticalAlign: 'top',
              margin: '-24px -42px -22px -42px',
            }}
          />
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 520, mx: { xs: 'auto', lg: 0 } }}
        >
          {text.SUBTITLE}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
          justifyContent={{ xs: 'center', lg: 'flex-start' }}
        >
          <CustomButton
            variantType="contained"
            onClick={handleUploadCsvClick}
            startIcon={<FileUploadOutlined />}
            sx={{
              py: 1.25,
              px: 3.5,
              fontSize: '1.05rem',
              borderRadius: '14px',
            }}
          >
            {text.BUTTONS.UPLOAD_CSV}
          </CustomButton>
          <CustomButton
            variantType="outlined"
            onClick={handleSignUpClick}
            sx={{
              py: 1.25,
              px: 3.5,
              fontSize: '1.05rem',
              borderRadius: '14px',
              bgcolor: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {text.BUTTONS.CREATE_ACCOUNT}
          </CustomButton>
        </Stack>

        <HomeCheckList items={text.CHECKS} />

        <Stack
          spacing={1}
          mt={2}
          direction="row"
          justifyContent={{ xs: 'center', lg: 'flex-start' }}
        >
          <Typography
            sx={{ fontSize: '1.1rem', fontWeight: 600 }}
            color="text.primary"
          >
            {text.SUBTEXT}
          </Typography>
          <Link
            href="/signin"
            color="secondary.main"
            underline="always"
            sx={{ fontSize: '1.1rem', fontWeight: 800 }}
          >
            {text.SIGN_IN_LINK}
          </Link>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <Image
          src={heroPreview}
          alt="Penny"
          priority
          sizes="(max-width: 1200px) 100vw, 55vw"
          style={{ width: '100%', height: 'auto', maxWidth: 760 }}
        />
      </Box>
    </Box>
  );
}
