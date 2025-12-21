import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import ProfileClient from '@/components/ProfileClient/ProfileClient';
import { UserInfo } from 'schemas';
import { fetchUserInfo } from '@/requests/fetchUserInfo';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const profilePageText = dict.PROFILE_PAGE;

  const user: UserInfo | null = await fetchUserInfo();

  return (
    <Container maxWidth="sm">
      <ProfileClient profilePageText={profilePageText} userData={user} />
    </Container>
  );
}
