'use client';

import { Box, Container, Typography, Stack } from '@mui/material';
import CustomButton from '../ui/CustomButton/CustomButton';
import { useRouter } from 'next/navigation';

export default function HomeFinalCTASection() {
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
          Start taking control of your money today
        </Typography>
        <Typography variant="body1" mb={4}>
          Safe, secure, and effortless. Upload your bank CSV in seconds.
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
            Upload CSV
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
            Create free account
          </CustomButton>
        </Stack>
      </Container>
    </Box>
  );
}
