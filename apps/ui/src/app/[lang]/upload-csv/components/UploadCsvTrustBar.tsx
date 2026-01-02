import { Box, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface UploadCsvTrustBarProps {
  trustBarTextItems: string[];
}

const UploadCsvTrustBar = ({ trustBarTextItems }: UploadCsvTrustBarProps) => {
  const items = trustBarTextItems.map((item) => ({
    icon: <CheckCircleIcon color="primary" />,
    text: item,
  }));

  return (
    <Box
      sx={{
        mt: 4,
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: 'grey.50',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 4 }}
        justifyContent="space-between"
        alignItems="center"
      >
        {items.map((item, idx) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center">
            {item.icon}
            <Typography variant="body1" fontWeight={500}>
              {item.text}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default UploadCsvTrustBar;
