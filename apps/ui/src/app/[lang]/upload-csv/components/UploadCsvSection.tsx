'use client';

import { Box, Container, Stack, Typography, Tooltip } from '@mui/material';
import { useState } from 'react';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import UploadFileContainer from './UploadFileContainer';
import UploadCsvTrustBar from './UploadCsvTrustBar';
import UploadCsvFormatOverview from './UploadCsvFormatOverview';

interface UploadCsvSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadCsvPageText: Record<string, any>;
}

export default function UploadCsvSection({
  uploadCsvPageText,
}: UploadCsvSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Header / Hero */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: 'primary.contrastText',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={800}>
            Upload CSV
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Import your transactions into Penny in seconds using a clean,
            structured CSV file downloaded from you bank account.
          </Typography>
        </Stack>
      </Box>

      <UploadCsvFormatOverview />

      <UploadCsvTrustBar />

      <UploadFileContainer
        selectedFile={selectedFile}
        onFileUpload={handleFileUpload}
      />

      <Box sx={{ textAlign: 'right' }}>
        <Tooltip
          title={
            !selectedFile
              ? 'Upload CSV file to submit transactions'
              : 'Proceed editing transactions'
          }
        >
          <CustomButton
            variantType="primary"
            buttonSize="medium"
            disabledStyling={!selectedFile}
          >
            Import transactions
          </CustomButton>
        </Tooltip>
      </Box>
    </Container>
  );
}
