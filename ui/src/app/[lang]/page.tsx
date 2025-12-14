import { Button, Typography } from '@mui/material';
import { getDictionary } from '../../utils/getDictionary';
import LanguageSwitcher from 'ui/src/components/LanguageSwitcher';

export default async function Page({ params }: { params: Promise<{ lang: 'en' | 'ru' | 'ua' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <main style={{ padding: 20 }}>
      <LanguageSwitcher />
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
