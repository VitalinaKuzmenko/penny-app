'use client';

import { Box, Container, Typography, Tooltip } from '@mui/material';
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

      router.push(`/import/${importId}/transactions`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(mapUploadCsvErrorToUiError(err, uploadCsvPageText));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => setSelectedFile(file);

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Hero */}
      <Box sx={{ p: { xs: 3, md: 3 } }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {uploadCsvPageText.TITLE}
        </Typography>

        <Typography color="text.secondary" mb={3}>
          {uploadCsvPageText.SUBTITLE}
        </Typography>
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
