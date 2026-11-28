import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { Box, Stack, Typography } from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import StorageOutlined from '@mui/icons-material/StorageOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';

interface UploadCsvFormatOverviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatOverviewText: Record<string, any>;
}

const UploadCsvFormatOverview = ({
  formatOverviewText,
}: UploadCsvFormatOverviewProps) => {
  const columnNames: string[] = formatOverviewText.COLUMNS;

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

  const infoItems = [
    {
      icon: <DescriptionOutlined />,
      title: formatOverviewText.FORMAT_TITLE,
      text: formatOverviewText.FORMAT_TEXT,
    },
    {
      icon: <ViewListOutlined />,
      title: formatOverviewText.COLUMNS_TITLE,
      text: columnNames.join(', '),
    },
    {
      icon: <StorageOutlined />,
      title: formatOverviewText.SIZE_TITLE,
      text: formatOverviewText.SIZE_TEXT,
    },
  ];

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        {infoItems.map((item, index) => (
          <Stack
            key={item.title}
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              px: { sm: 2 },
              borderLeft: { sm: index > 0 ? '1px solid' : 'none' },
              borderColor: 'rgba(83, 36, 70, 0.07)',
              color: 'secondary.main',
              '& > .MuiSvgIcon-root': { fontSize: 38, flexShrink: 0 },
            }}
          >
            {item.icon}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.text}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{
          p: 2,
          borderRadius: '16px',
          bgcolor: 'sidebar.activeBackground',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(183, 154, 217, 0.35)',
              color: 'secondary.main',
            }}
          >
            <TableChartOutlined />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {formatOverviewText.HELP_TITLE}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatOverviewText.DOWNLOAD_TEXT}
            </Typography>
          </Box>
        </Stack>

        <CustomButton
          variantType="secondary"
          color="secondary"
          onClick={downloadCsvTemplate}
          startIcon={<DownloadIcon />}
          sx={{
            flexShrink: 0,
            bgcolor: '#FDF8FF',
            color: 'text.primary',
            borderColor: 'secondary.main',
            borderRadius: '12px',
            '& .MuiButton-startIcon': { color: 'secondary.main' },
            '&:hover': { bgcolor: '#F7EDFC', borderColor: 'secondary.main' },
          }}
        >
          {formatOverviewText.DOWNLOAD_BUTTON}
        </CustomButton>
      </Stack>
    </Stack>
  );
};

export default UploadCsvFormatOverview;
