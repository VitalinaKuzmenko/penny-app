import { Box, Typography } from '@mui/material';
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

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        }}
      >
        {accounts.map((account) => (
          <Box
            key={account.id}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="body2" color="text.secondary" noWrap>
              {account.name}
            </Typography>

            {account.lastTransactionDate ? (
              <>
                <Typography variant="h6" fontWeight={700}>
                  {formatDay(account.lastTransactionDate, lang)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDaysAgo(account.lastTransactionDate, lang)}
                </Typography>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" mt={0.5}>
                {text.NO_TRANSACTIONS}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
