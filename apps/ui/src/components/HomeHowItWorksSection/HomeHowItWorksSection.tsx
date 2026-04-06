'use client';

import { Box, Container, Typography, Grid } from '@mui/material';

export default function HomeHowItWorksSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const steps = [
    {
      step: homePageText.HOW_IT_WORKS_SECTION.STEPS[0].STEP_NUMBER,
      title: homePageText.HOW_IT_WORKS_SECTION.STEPS[0].TITLE,
      description: homePageText.HOW_IT_WORKS_SECTION.STEPS[0].DESCRIPTION,
    },
    {
      step: homePageText.HOW_IT_WORKS_SECTION.STEPS[1].STEP_NUMBER,
      title: homePageText.HOW_IT_WORKS_SECTION.STEPS[1].TITLE,
      description: homePageText.HOW_IT_WORKS_SECTION.STEPS[1].DESCRIPTION,
    },
    {
      step: homePageText.HOW_IT_WORKS_SECTION.STEPS[2].STEP_NUMBER,
      title: homePageText.HOW_IT_WORKS_SECTION.STEPS[2].TITLE,
      description: homePageText.HOW_IT_WORKS_SECTION.STEPS[2].DESCRIPTION,
    },
  ];

  const stepColors = ['primary.main', 'secondary.main', 'info.main'];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        {/* Title */}
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>
          {homePageText.HOW_IT_WORKS_SECTION.TITLE}
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
