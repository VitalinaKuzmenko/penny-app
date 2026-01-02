'use client';

import { Box, Container, Stack, Typography, Tooltip } from '@mui/material';
import { useState } from 'react';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import UploadFileContainer from './UploadFileContainer';
import UploadCsvTrustBar from './UploadCsvTrustBar';
import UploadCsvFormatOverview from './UploadCsvFormatOverview';
import { UiError } from '@/types/interfaces';
import { useRouter } from 'next/navigation';
import { uploadCsvFile } from '@/requests/importCsv';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { mapUploadCsvErrorToUiError } from '@/utils/mapUploadCsvErrorToUiError';

interface UploadCsvSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadCsvPageText: Record<string, any>;
}

export default function UploadCsvSection({
  uploadCsvPageText,
}: UploadCsvSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<UiError | null>(null);

  const router = useRouter();

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);

      const { importId } = await uploadCsvFile(selectedFile);

      console.log('importId', importId);
      // 👉 Redirect to next step
      // router.push(`/transactions/import/${importId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(mapUploadCsvErrorToUiError(err));
    } finally {
      setLoading(false);
    }
  };

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

      <ErrorBanner error={error} colorMode="light" />

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
            loading={loading}
            onClick={handleImport}
          >
            {uploadCsvPageText.IMPORT_BUTTON.LABEL}
          </CustomButton>
        </Tooltip>
      </Box>
    </Container>
  );
}
