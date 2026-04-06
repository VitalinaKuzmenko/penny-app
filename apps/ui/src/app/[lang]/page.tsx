import { Container } from '@mui/material';
import { getDictionary } from '@/utils/getDictionary';
import { LanguageType } from '@/utils/interfaces';
import HomeHeroSection from '@/components/HomeHeroSection/HomeHeroSection';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, md: 3 },
        maxWidth: { xs: '100%', md: 'xl' },
      }}
    >
      <HomeHeroSection />
    </Container>
  );
}
