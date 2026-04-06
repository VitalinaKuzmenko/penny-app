'use client';

import { Box, Container, Typography, Stack } from '@mui/material';
import CustomButton from '../ui/CustomButton/CustomButton';
import { useRouter } from 'next/navigation';

export default function HomeFinalCTASection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const router = useRouter();
  const handleSignUpClick = () => {
    router.push('/register');
  };

  const handleUploadCsvClick = () => {
    router.push('/upload-csv');
  };
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} mb={3}>
          {homePageText.FINAL_CTA_SECTION.TITLE}
        </Typography>
        <Typography variant="body1" mb={4}>
          {homePageText.FINAL_CTA_SECTION.SUBTITLE}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <CustomButton
            variantType="outlined"
            onClick={handleUploadCsvClick}
            sx={{
              fontWeight: 800,
              px: 4,
              color: 'primary.contrastText',
              borderColor: 'primary.contrastText',
            }}
          >
            {homePageText.FINAL_CTA_SECTION.BUTTONS.UPLOAD_CSV}
          </CustomButton>
          <CustomButton
            sx={{
              px: 4,
              color: 'primary.contrastText',
              borderColor: 'primary.contrastText',
            }}
            variantType="outlined"
            onClick={handleSignUpClick}
          >
            {homePageText.FINAL_CTA_SECTION.BUTTONS.CREATE_ACCOUNT}
          </CustomButton>
        </Stack>
      </Container>
    </Box>
  );
}
