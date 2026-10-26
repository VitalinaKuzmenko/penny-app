import { Box, Stack, Typography } from '@mui/material';
import { AccountWithActivity } from 'schemas';

import { formatDay, formatDaysAgo } from '@/utils/formatAccountDates';

interface AccountsLastImportProps {
  accounts: AccountWithActivity[];
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: Record<string, any>;
}

export default function AccountsLastImport({
  accounts,
  lang,
  text,
}: AccountsLastImportProps) {
  if (accounts.length === 0) return null;

  return (
    <Box
      sx={{
        mx: { xs: 3, md: 3 },
        mb: 4,
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: 'grey.50',
      }}
    >
      <Typography variant="h6" fontWeight={600}>
        {text.TITLE}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {text.SUBTITLE}
      </Typography>

      <Stack spacing={1.5}>
        {accounts.map((account) => (
          <Stack
            key={account.id}
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 0.5, md: 2 }}
            justifyContent="space-between"
          >
            <Typography fontWeight={600}>{account.name}</Typography>

            {account.lastTransactionDate ? (
              <Typography variant="body2">
                {text.DATA_UP_TO.replace(
                  '{date}',
                  formatDay(account.lastTransactionDate, lang),
                ).replace(
                  '{relative}',
                  formatDaysAgo(account.lastTransactionDate, lang),
                )}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {text.NO_TRANSACTIONS}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
