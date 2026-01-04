import CustomButton from '@/components/ui/CustomButton/CustomButton';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';

interface UploadCsvFormatOverviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatOverviewText: Record<string, any>;
}

const UploadCsvFormatOverview = ({
  formatOverviewText,
}: UploadCsvFormatOverviewProps) => {
  const columnNames: string[] = formatOverviewText.COLUMNS;
  const rows: string[][] = formatOverviewText.EXAMPLE_TABLE;

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

  return (
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
              {formatOverviewText.TITLE}
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
              {formatOverviewText.REQUIRED_COLUMNS}
            </Typography>
            <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
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

          {/* Table + Download */}
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="stretch">
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
                            index === columnNames.length - 1 ? 'right' : 'left'
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
                    {rows.map((row, index) => (
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
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <CustomButton
                variantType="secondary"
                onClick={downloadCsvTemplate}
                startIcon={<DownloadIcon />}
              >
                {formatOverviewText.DOWNLOAD_BUTTON}
              </CustomButton>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                {formatOverviewText.DOWNLOAD_TEXT}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UploadCsvFormatOverview;
