import { Box, Typography } from '@mui/material';
import CheckRounded from '@mui/icons-material/CheckRounded';

interface ImportStepperProps {
  labels: string[];
  // zero-based index of the step the user is on
  currentStep: number;
}

// Display-only progress indicator for the import flow
const ImportStepper = ({ labels, currentStep }: ImportStepperProps) => (
  <Box
    component="ol"
    sx={{
      listStyle: 'none',
      m: 0,
      p: 0,
      // keeps the steps above the hero illustration that overlaps them
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 1, md: 2 },
    }}
  >
    {labels.map((label, index) => {
      const done = index < currentStep;
      const active = index === currentStep;

      return (
        <Box
          component="li"
          key={label}
          aria-current={active ? 'step' : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, md: 2 },
            flex: index < labels.length - 1 ? 1 : 'none',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: { xs: 1, md: 2 },
              py: 0.75,
              borderRadius: 999,
              bgcolor: active ? '#F5E6FA' : '#FDF6F4',
              border: '1.5px solid',
              borderColor: active ? '#C9A8E6' : 'transparent',
              boxShadow: '0 2px 10px rgba(83, 36, 70, 0.08)',
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                bgcolor: done
                  ? '#CDEFD9'
                  : active
                    ? 'secondary.main'
                    : '#F8E6E2',
                color: done
                  ? 'success.dark'
                  : active
                    ? 'secondary.contrastText'
                    : 'secondary.main',
              }}
            >
              {done ? <CheckRounded fontSize="small" /> : index + 1}
            </Box>
            <Typography
              fontWeight={700}
              sx={{ display: { xs: active ? 'block' : 'none', sm: 'block' } }}
            >
              {label}
            </Typography>
          </Box>

          {index < labels.length - 1 && (
            <Box
              aria-hidden
              sx={{
                flex: 1,
                height: 2,
                borderRadius: 1,
                bgcolor: 'secondary.light',
                opacity: 0.6,
              }}
            />
          )}
        </Box>
      );
    })}
  </Box>
);

export default ImportStepper;
