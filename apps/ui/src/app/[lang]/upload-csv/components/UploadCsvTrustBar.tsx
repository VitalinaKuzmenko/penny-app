import { Box, Stack, Typography } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';

interface UploadCsvTrustBarProps {
  trustBarTextItems: { TITLE: string; TEXT: string }[];
}

const icons = [CheckCircleOutline, EditOutlined, LockOutlined];

const UploadCsvTrustBar = ({ trustBarTextItems }: UploadCsvTrustBarProps) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: '20px',
      bgcolor: 'rgba(16, 185, 129, 0.08)',
      border: '1px solid rgba(16, 185, 129, 0.18)',
    }}
  >
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 1.5,
      }}
    >
      {trustBarTextItems.map((item, idx) => {
        const Icon = icons[idx % icons.length];
        return (
          <Box
            key={item.TITLE}
            sx={{
              px: { sm: 1 },
              borderLeft: { sm: idx > 0 ? '1px solid' : 'none' },
              borderColor: 'success.light',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="flex-start">
              {/* stays on the first line when the title wraps */}
              <Icon
                fontSize="small"
                sx={{ color: 'success.dark', flexShrink: 0, mt: '1px' }}
              />
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {item.TITLE}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.35, mt: 0.25 }}
            >
              {item.TEXT}
            </Typography>
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default UploadCsvTrustBar;
