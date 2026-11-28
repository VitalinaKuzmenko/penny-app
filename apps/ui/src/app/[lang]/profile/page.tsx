import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import ProfileClientSection from './components/ProfileClientSection';

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
    <Container
      maxWidth="xl"
      sx={{ px: { xs: 0, md: 3 }, maxWidth: { xs: '100%', md: 'xl' } }}
    >
      <ProfileClientSection profilePageText={profilePageText} />
    </Container>
  );
}
