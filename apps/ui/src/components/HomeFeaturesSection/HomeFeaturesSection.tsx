'use client';

import { Box, Grid, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PublicIcon from '@mui/icons-material/Public';
import PaymentsIcon from '@mui/icons-material/Payments';

const features = [
  {
    icon: <SecurityIcon color="primary" />,
    title: 'Secure',
    description: 'No bank login needed',
  },
  {
    icon: <FlashOnIcon sx={{ color: 'warning.main' }} />,
    title: 'Fast',
    description: 'Upload & analyze in seconds',
  },
  {
    icon: <PublicIcon sx={{ color: 'info.main' }} />,
    title: 'Universal',
    description: 'Works with any bank CSV',
  },
  {
    icon: <PaymentsIcon sx={{ color: 'success.main' }} />,
    title: 'All-in-one tracking',
    description: 'Track cash & card expenses together',
  },
];

export default function HomeFeaturesSection() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid size={{ xs: 6, md: 3 }} key={index}>
            <Box
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                textAlign: 'center',
                transition: '0.2s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ mb: 1.5 }}>{feature.icon}</Box>

              <Typography variant="subtitle1" fontWeight={600}>
                {feature.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {feature.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
