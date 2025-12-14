import { Button, Typography } from '@mui/material';
import { getDictionary } from '../../utils/getDictionary';
import { LanguageType } from 'ui/src/utils/interfaces';
import LanguageSwitcher from 'ui/src/components/LanguageSwitcher/LanguageSwitcher';

export default async function Page({ params }: { params: Promise<{ lang: LanguageType }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <main style={{ padding: 20 }}>
      <Typography
        variant="h4"
        gutterBottom
      >
        Welcome!
      </Typography>

      <Typography
        variant="body1"
        gutterBottom
      >
        {dict.HOMEPAGE.HEADER}
      </Typography>

      <Button
        variant="contained"
        color="primary"
      >
        Get Started
      </Button>
    </main>
  );
}
