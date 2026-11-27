import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import SettingsClient from './components/SettingsClient';
import { SETTINGS_TABS, SettingsTab } from './components/settingsTabs';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: LanguageType }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { lang } = await params;
  const { tab } = await searchParams;
  const dict = await getDictionary(lang);

  const initialTab: SettingsTab = SETTINGS_TABS.includes(tab as SettingsTab)
    ? (tab as SettingsTab)
    : 'categories';

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
      <SettingsClient initialTab={initialTab} pageText={dict.SETTINGS_PAGE} />
    </Container>
  );
}
