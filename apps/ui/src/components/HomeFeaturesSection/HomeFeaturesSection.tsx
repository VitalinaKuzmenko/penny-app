'use client';

import { Box, Grid, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PublicIcon from '@mui/icons-material/Public';
import PaymentsIcon from '@mui/icons-material/Payments';

export default function HomeFeaturesSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const features = [
    {
      icon: <SecurityIcon color="primary" />,
      title: homePageText.FEATURES_SECTION.FEATURES[0].TITLE,
      description: homePageText.FEATURES_SECTION.FEATURES[0].DESCRIPTION,
    },
    {
      icon: <FlashOnIcon sx={{ color: 'warning.main' }} />,
      title: homePageText.FEATURES_SECTION.FEATURES[1].TITLE,
      description: homePageText.FEATURES_SECTION.FEATURES[1].DESCRIPTION,
    },
    {
      icon: <PublicIcon sx={{ color: 'info.main' }} />,
      title: homePageText.FEATURES_SECTION.FEATURES[2].TITLE,
      description: homePageText.FEATURES_SECTION.FEATURES[2].DESCRIPTION,
    },
    {
      icon: <PaymentsIcon sx={{ color: 'success.main' }} />,
      title: homePageText.FEATURES_SECTION.FEATURES[3].TITLE,
      description: homePageText.FEATURES_SECTION.FEATURES[3].DESCRIPTION,
    },
  ];
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
                {homePageText.FEATURES_SECTION.TITLE}
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
