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

  const handleFileUpload = (file: File) => setSelectedFile(file);

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Hero */}
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
            {uploadCsvPageText.TITLE}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {uploadCsvPageText.SUBTITLE}
          </Typography>
        </Stack>
      </Box>

      <UploadCsvFormatOverview
        formatOverviewText={uploadCsvPageText.CSV_FORMAT_OVERVIEW}
      />
      <UploadCsvTrustBar trustBarTextItems={uploadCsvPageText.TRUST_BAR} />
      <UploadFileContainer
        selectedFile={selectedFile}
        onFileUpload={handleFileUpload}
        fileContainerText={uploadCsvPageText.UPLOAD_FILE}
      />

      <Box sx={{ textAlign: 'right' }}>
        <Tooltip
          title={
            !selectedFile
              ? uploadCsvPageText.IMPORT_BUTTON.TOOLTIP_NO_FILE
              : uploadCsvPageText.IMPORT_BUTTON.TOOLTIP_WITH_FILE
          }
        >
          <CustomButton
            variantType="primary"
            buttonSize="medium"
            disabledStyling={!selectedFile}
          >
            {uploadCsvPageText.IMPORT_BUTTON.LABEL}
          </CustomButton>
        </Tooltip>
      </Box>
    </Container>
  );
}
