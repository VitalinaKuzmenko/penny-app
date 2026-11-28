import { Container, Box } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import RegisterForm from './components/RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: LanguageType }>;
}) {
  const { lang } = await params;

  const dict = await getDictionary(lang);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registerPageText: Record<string, any> = dict.REGISTER_PAGE;

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
        <RegisterForm registerPageText={registerPageText} />
      </Box>
    </Container>
  );
}
