import { Container } from '@mui/material';
import { getDictionary } from '@/utils/getDictionary';
import { LanguageType } from '@/utils/interfaces';
import HomeHeroSection from '@/components/HomeHeroSection/HomeHeroSection';
import HomeFeaturesSection from '@/components/HomeFeaturesSection/HomeFeaturesSection';
import HomeHowItWorksSection from '@/components/HomeHowItWorksSection/HomeHowItWorksSection';
import HomeTestimonialsSection from '@/components/HomeTestimonialsSection/HomeTestimonialsSection';
import HomeFinalCTASection from '@/components/HomeFinalCTASection/HomeFinalCTASection';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const homePageText = dict.HOMEPAGE;

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, md: 3 },
        maxWidth: { xs: '100%', md: 'xl' },
      }}
    >
      <HomeHeroSection homePageText={homePageText} lang={lang} />
      <HomeFeaturesSection homePageText={homePageText} />
      <HomeHowItWorksSection homePageText={homePageText} />
      <HomeTestimonialsSection homePageText={homePageText} />
      <HomeFinalCTASection homePageText={homePageText} />
    </Container>
  );
}
