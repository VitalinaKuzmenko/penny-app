'use client';

import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import Image from 'next/image';
import { ReactNode, useState } from 'react';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import UploadFileContainer from './UploadFileContainer';
import UploadCsvTrustBar from './UploadCsvTrustBar';
import UploadCsvFormatOverview from './UploadCsvFormatOverview';
import UploadCsvStepper from './UploadCsvStepper';
import UploadCsvWhatNext from './UploadCsvWhatNext';
import heart from '../../../../../public/heart.png';
import books from '../../../../../public/books.png';
import { UiError } from '@/types/interfaces';
import { useRouter } from 'next/navigation';
import { uploadCsvFile } from '@/requests/importCsv';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { mapUploadCsvErrorToUiError } from '@/utils/mapUploadCsvErrorToUiError';

interface UploadCsvSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadCsvPageText: Record<string, any>;
  accountsSummary?: ReactNode;
}

export default function UploadCsvSection({
  uploadCsvPageText,
  accountsSummary,
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
      <Box sx={{ position: 'relative', pb: { xs: 2, md: 3 } }}>
        <Box sx={{ maxWidth: { md: '58%' } }}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: 'secondary.main',
                fontSize: { xs: '2rem', md: '2.75rem' },
              }}
            >
              {uploadCsvPageText.TITLE}
            </Typography>
            <Image src={heart} alt="" aria-hidden width={44} height={39} />
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
            {uploadCsvPageText.SUBTITLE}
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: -16,
            right: 0,
            width: 'min(40%, 480px)',
            pointerEvents: 'none',
          }}
        >
          <Image
            src={books}
            alt=""
            aria-hidden
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 2, md: 5 } }}>
        <UploadCsvStepper labels={uploadCsvPageText.STEPPER} />
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          },
        }}
      >
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '24px' }}>
          <Stack spacing={2.5}>
            <UploadFileContainer
              selectedFile={selectedFile}
              onFileUpload={handleFileUpload}
              fileContainerText={uploadCsvPageText.UPLOAD_FILE}
            />

            <UploadCsvFormatOverview
              formatOverviewText={uploadCsvPageText.CSV_FORMAT_OVERVIEW}
            />

            <ErrorBanner error={error} colorMode="light" />

            <Tooltip
              title={
                !selectedFile
                  ? uploadCsvPageText.IMPORT_BUTTON.TOOLTIP_NO_FILE
                  : uploadCsvPageText.IMPORT_BUTTON.TOOLTIP_WITH_FILE
              }
            >
              <Box>
                <CustomButton
                  variantType="primary"
                  disabledStyling={!selectedFile}
                  loading={loading}
                  onClick={handleImport}
                  fullWidth
                  startIcon={
                    <FileUploadOutlined
                      sx={{ fontSize: '1.9rem !important' }}
                    />
                  }
                  sx={{ py: 0.7, fontSize: '1.4rem', borderRadius: '14px' }}
                >
                  {uploadCsvPageText.IMPORT_BUTTON.LABEL}
                </CustomButton>
              </Box>
            </Tooltip>
          </Stack>
        </Paper>

        <Stack spacing={3}>
          {accountsSummary}
          <UploadCsvWhatNext text={uploadCsvPageText.WHAT_NEXT} />
          <UploadCsvTrustBar trustBarTextItems={uploadCsvPageText.TRUST_BAR} />
        </Stack>
      </Box>
    </Container>
  );
}
