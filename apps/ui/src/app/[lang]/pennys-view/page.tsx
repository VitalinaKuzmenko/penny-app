import { Container } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import MainDashboard from './components/MainDashboard';

export const dynamic = 'force-dynamic';

export default async function PennysViewPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Container maxWidth="xl">
      <MainDashboard />
    </Container>
  );
}
