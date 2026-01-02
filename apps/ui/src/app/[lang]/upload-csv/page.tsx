import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import ProfileClient from '@/components/ProfileClientSection/ProfileClientSection';

export const dynamic = 'force-dynamic';

export default async function UploadCsvPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const profilePageText = dict.UPLOAD_CSV_PAGE;

  return (
    <Container maxWidth="sm">
      <ProfileClient profilePageText={profilePageText} />
    </Container>
  );
}
