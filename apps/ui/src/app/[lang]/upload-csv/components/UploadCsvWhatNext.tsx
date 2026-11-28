import { Box, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import star from '../../../../../public/star_icon.png';
import notebook from '../../../../../public/notebook_image.png';

interface WhatNextStep {
  TITLE: string;
  TEXT: string;
}

interface UploadCsvWhatNextProps {
  text: { TITLE: string; STEPS: WhatNextStep[] };
}

const UploadCsvWhatNext = ({ text }: UploadCsvWhatNextProps) => (
  <Paper
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: '24px',
      bgcolor: '#FFF9F6',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
      <Image src={star} alt="" aria-hidden width={32} height={29} />
      <Typography variant="h6" component="h2" color="secondary.main">
        {text.TITLE}
      </Typography>
    </Stack>

    <Stack
      component="ol"
      spacing={2}
      sx={{ listStyle: 'none', m: 0, p: 0, pr: { sm: '28%' } }}
    >
      {text.STEPS.map((step, index) => (
        <Stack component="li" key={step.TITLE} direction="row" spacing={2}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              bgcolor: 'sidebar.activeBackground',
              color: 'secondary.main',
            }}
          >
            {index + 1}
          </Box>
          <Box>
            <Typography fontWeight={700} color="text.primary">
              {step.TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step.TEXT}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>

    <Box
      sx={{
        display: { xs: 'none', sm: 'block' },
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: '22%',
        maxWidth: 130,
        pointerEvents: 'none',
      }}
    >
      <Image
        src={notebook}
        alt=""
        aria-hidden
        style={{ width: '100%', height: 'auto' }}
      />
    </Box>
  </Paper>
);

export default UploadCsvWhatNext;
