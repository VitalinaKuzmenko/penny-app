'use client';

import { Box, Typography } from '@mui/material';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import {
  InsightsStepMock,
  ReviewStepMock,
  UploadStepMock,
} from './HomeStepMockups';

export default function HomeHowItWorksSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const text = homePageText.HOW_IT_WORKS_SECTION;
  const steps: string[] = text.STEPS;
  const mock = text.MOCK;
  const mockups = [UploadStepMock, ReviewStepMock, InsightsStepMock];

  return (
    <Box
      sx={{
        mt: { xs: 5, md: 7 },
        p: { xs: 2, md: 3 },
        borderRadius: '28px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #F7EFFC 0%, #F3E8FA 100%)',
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{ color: 'secondary.main', fontSize: { xs: '1.6rem', md: '2rem' } }}
      >
        {text.TITLE}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {text.SUBTITLE}
      </Typography>

      <Box
        component="ol"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          // lg: cards stretch to the tallest one so all three match
          alignItems: { xs: 'center', lg: 'stretch' },
          justifyContent: 'center',
          gap: { xs: 1, lg: 1.5 },
        }}
      >
        {mockups.map((Mockup, index) => (
          <Box component="li" key={steps[index]} sx={{ display: 'contents' }}>
            <Box
              sx={{
                flex: { lg: 1 },
                minWidth: 0,
                width: { xs: '100%', sm: 420, lg: 'auto' },
                maxWidth: '100%',
                pt: 1.5,
                display: 'flex',
              }}
            >
              <Mockup label={steps[index]} mock={mock} />
            </Box>
            {index < mockups.length - 1 && (
              <ArrowForwardRounded
                aria-hidden
                sx={{
                  color: 'secondary.light',
                  fontSize: 32,
                  flexShrink: 0,
                  alignSelf: 'center',
                  transform: { xs: 'rotate(90deg)', lg: 'none' },
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
