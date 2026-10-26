import { Container } from '@mui/material';
import { AccountWithActivity } from 'schemas';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import { getAccounts } from '@/requests/getAccounts';

import UploadCsvSection from '../upload-csv/components/UploadCsvSection';
import AccountsLastImport from './components/AccountsLastImport';

export const dynamic = 'force-dynamic';

export default async function UploadCsvPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const uploadCsvPageText = dict.UPLOAD_CSV_PAGE;

  // The summary is a nice-to-have; uploading must still work if it fails to load
  let accounts: AccountWithActivity[] = [];
  try {
    accounts = await getAccounts();
  } catch (err) {
    console.error('Failed to load accounts for upload page', err);
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, md: 3 },
        maxWidth: { xs: '100%', md: 'xl' },
      }}
    >
      <UploadCsvSection
        uploadCsvPageText={uploadCsvPageText}
        accountsSummary={
          <AccountsLastImport
            accounts={accounts}
            lang={lang}
            text={uploadCsvPageText.ACCOUNTS_ACTIVITY}
          />
        }
      />
    </Container>
  );
}
