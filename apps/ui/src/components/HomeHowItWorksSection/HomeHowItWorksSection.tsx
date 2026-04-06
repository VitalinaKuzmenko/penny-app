'use client';

import { Box, Container, Typography, Grid } from '@mui/material';

const steps = [
  {
    step: '01',
    title: 'Upload your data',
    description:
      'Upload your bank CSV in seconds — simple, secure, and connection-free.',
  },
  {
    step: '02',
    title: 'Take back control',
    description:
      'No generic auto-categories — you decide how every expense is classified.',
  },
  {
    step: '03',
    title: 'Turn data into clarity',
    description:
      'Track trends, uncover patterns, and finally understand your spending.',
  },
];

export default function HomeHowItWorksSection() {
  const stepColors = ['primary.main', 'secondary.main', 'info.main'];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        {/* Title */}
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>
          How it works
        </Typography>

        <Grid container spacing={4}>
          {steps.map((item, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top accent bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    backgroundColor: stepColors[index],
                  }}
                />

                {/* Step number */}
                <Typography
                  variant="h6"
                  sx={{
                    color: stepColors[index],
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {item.step}
                </Typography>

                <Typography variant="h6" fontWeight={600} mb={1}>
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
