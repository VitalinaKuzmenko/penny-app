'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import UploadFileContainer from './UploadFileContainer';
import UploadCsvTrustBar from './UploadCsvTrustBar';

interface UploadCsvSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadCsvPageText: Record<string, any>;
}

export default function UploadCsvSection({
  uploadCsvPageText,
}: UploadCsvSectionProps) {
  const columnNames = ['date', 'description', 'amount'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const downloadCsvTemplate = () => {
    const link = document.createElement('a');
    link.href = '/penny_template.csv';
    link.download = 'penny_template.csv';

    document.body.appendChild(link);
    link.click();

    // Safe cleanup
    setTimeout(() => {
      document.body.removeChild(link);
    }, 0);
  };

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
            structured CSV file.
          </Typography>
        </Stack>
      </Box>

      {/* Main Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
            {/* Section Title */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <DescriptionIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                CSV Format Overview
              </Typography>
            </Stack>

            {/* Required Columns */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                gutterBottom
                sx={{ m: 0 }}
              >
                Required columns:
              </Typography>

              <Stack
                direction="row"
                flexWrap="wrap"
                sx={{
                  rowGap: 1,
                }}
              >
                {columnNames.map((col) => (
                  <Chip
                    key={col}
                    label={col}
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      borderRadius: 3,
                      px: 1.75,
                      py: 0.75,
                      mr: 1,
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      color: 'primary.contrastText',
                      boxShadow: '0 6px 14px rgba(4, 22, 70, 0.25)',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider sx={{ my: 6, height: 2, bgcolor: 'primary.light' }} />

            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="stretch">
              {/* Table Preview */}
              <Box flex={1}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'primary.light',
                    overflowX: 'auto',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        }}
                      >
                        {columnNames.map((col, index) => (
                          <TableCell
                            align={
                              index === columnNames.length - 1
                                ? 'right'
                                : 'left'
                            }
                            key={col + index}
                            sx={{
                              fontWeight: 600,
                              color: 'primary.contrastText',
                            }}
                          >
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {[
                        ['01/01/2025', 'Groceries', '-45.90'],
                        ['03/01/2025', 'Salary', '2500.00'],
                        ['05/01/2025', 'Coffee', '-3.50'],
                      ].map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'grey.50',
                            },
                          }}
                        >
                          <TableCell>{row[0]}</TableCell>
                          <TableCell>{row[1]}</TableCell>
                          <TableCell align="right">{row[2]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>

              {/* CTA */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CustomButton
                  variantType="secondary"
                  buttonSize="medium"
                  startIcon={<DownloadIcon />}
                  onClick={downloadCsvTemplate}
                >
                  Download template
                </CustomButton>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: 'center' }}
                >
                  Use this if you want a ready-to-go file with the correct
                  format.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
