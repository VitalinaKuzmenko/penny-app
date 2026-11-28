'use client';

import { Box, Typography, Stack } from '@mui/material';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import CustomButton from '../ui/CustomButton/CustomButton';
import HomeCheckList from '../HomeCheckList/HomeCheckList';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import scene from '../../../public/home_page10.png';

export default function HomeFinalCTASection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const router = useRouter();
  const text = homePageText.FINAL_CTA_SECTION;

  const handleSignUpClick = () => {
    router.push('/register');
  };

  const handleUploadCsvClick = () => {
    router.push('/upload-csv');
  };

  return (
    <Box
      sx={{
        mt: { xs: 5, md: 7 },
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        borderRadius: '28px',
        bgcolor: 'sidebar.background',
        color: 'sidebar.text',
        display: 'grid',
        alignItems: 'center',
        gap: { xs: 2, md: 4 },
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 0.45fr) minmax(0, 1fr)',
        },
        textAlign: 'center',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Image
          src={scene}
          alt=""
          aria-hidden
          sizes="(max-width: 900px) 60vw, 25vw"
          style={{ width: '100%', maxWidth: 300, height: 'auto' }}
        />
      </Box>

      <Box>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            color: 'common.white',
            fontSize: { xs: '1.6rem', md: '2.1rem' },
          }}
        >
          {text.TITLE}
        </Typography>
        <Typography sx={{ mt: 1, mb: 3, color: 'sidebar.mutedText' }}>
          {text.SUBTITLE}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="center"
          sx={{ mb: 2.5 }}
        >
          <CustomButton
            variantType="primary"
            onClick={handleUploadCsvClick}
            startIcon={<FileUploadOutlined />}
            sx={{ py: 1.25, px: 4, fontSize: '1.05rem', borderRadius: '14px' }}
          >
            {text.BUTTONS.UPLOAD_CSV}
          </CustomButton>
          <CustomButton
            variantType="outlined"
            onClick={handleSignUpClick}
            sx={{
              py: 1.25,
              px: 4,
              fontSize: '1.05rem',
              borderRadius: '14px',
              color: 'common.white',
              borderColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                borderColor: 'common.white',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            {text.BUTTONS.CREATE_ACCOUNT}
          </CustomButton>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <HomeCheckList items={text.CHECKS} tone="dark" />
        </Box>
      </Box>
    </Box>
  );
}
