import { Container, Box } from '@mui/material';
import SignInForm from '@/components/SignInForm/SignInForm';

export default function SignInPage() {
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
        <SignInForm />
      </Box>
    </Container>
  );
}
