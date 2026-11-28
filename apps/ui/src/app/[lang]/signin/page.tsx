import { Container, Box } from '@mui/material';
import SignInForm from './components/SignInForm';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';

export const dynamic = 'force-dynamic';

export default async function SignInPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;

  const dict = await getDictionary(lang);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signInPageText: Record<string, any> = dict.SIGN_IN_PAGE;

  return (
    <Container maxWidth="sm" disableGutters>
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <SignInForm signInPageText={signInPageText} />
      </Box>
    </Container>
  );
}
