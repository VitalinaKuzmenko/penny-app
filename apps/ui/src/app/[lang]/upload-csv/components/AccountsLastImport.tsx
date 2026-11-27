import { Box, Paper, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { AccountWithActivity } from 'schemas';

import { formatDay } from '@/utils/formatAccountDates';

import AccountDateCard from './AccountDateCard';
import calendar from '../../../../../public/calendar_icon.png';

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
    <Paper
      sx={{ p: { xs: 2, md: 3 }, borderRadius: '24px', bgcolor: '#FFF9F6' }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Image src={calendar} alt="" aria-hidden width={32} height={31} />
        <Box>
          <Typography variant="h6" component="h2" color="secondary.main">
            {text.TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {text.SUBTITLE}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {accounts.map((account, index) => (
          <AccountDateCard
            key={account.id}
            index={index}
            name={account.name}
            date={
              account.lastTransactionDate
                ? formatDay(account.lastTransactionDate, lang)
                : null
            }
            emptyText={text.NO_TRANSACTIONS}
          />
        ))}
      </Box>
    </Paper>
  );
}
