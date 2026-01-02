import { Container, Box } from '@mui/material';
import { LanguageType } from '@/utils/interfaces';
import { getDictionary } from '@/utils/getDictionary';
import RegisterForm from '@/app/[lang]/register/components/RegisterForm';

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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '800px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RegisterForm registerPageText={registerPageText} />
      </Box>
    </Container>
  );
}
