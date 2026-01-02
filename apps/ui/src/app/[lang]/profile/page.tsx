import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import ProfileClientSection from '@/app/[lang]/profile/components/ProfileClientSection';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const profilePageText = dict.PROFILE_PAGE;

  return (
    <Container maxWidth="sm">
      <ProfileClientSection profilePageText={profilePageText} />
    </Container>
  );
}
