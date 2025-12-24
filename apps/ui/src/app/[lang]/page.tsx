import { Box, Button, Typography } from '@mui/material';
import { getDictionary } from '@/utils/getDictionary';
import { LanguageType } from '@/utils/interfaces';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome!
      </Typography>

      <Typography variant="body1" gutterBottom>
        {dict.HEADER.TITLE}
      </Typography>

      <Button variant="contained" color="primary">
        Get Started
      </Button>
    </Box>
  );
}
