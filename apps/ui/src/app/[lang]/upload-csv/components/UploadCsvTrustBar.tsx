import { Box, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

const UploadCsvTrustBar = () => {
  const items = [
    {
      icon: <CheckCircleIcon color="primary" />,
      text: "We'll check for missing columns automatically",
    },
    {
      icon: <EditIcon color="primary" />,
      text: "You'll be able to edit entries after upload",
    },
    {
      icon: <LockIcon color="primary" />,
      text: 'Only you can see your uploaded data',
    },
  ];

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
