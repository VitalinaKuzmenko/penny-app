import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';

import UploadCsvSection from '../upload-csv/components/UploadCsvSection';

export const dynamic = 'force-dynamic';

export default async function UploadCsvPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const uploadCsvPageText = dict.UPLOAD_CSV_PAGE;

  return (
    <Container maxWidth="xl">
      <UploadCsvSection uploadCsvPageText={uploadCsvPageText} />
    </Container>
  );
}
