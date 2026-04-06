'use client';

import { Box, Container, Grid, Typography, Avatar } from '@mui/material';

const testimonials = [
  {
    name: 'Alex R.',
    role: 'Freelancer',
    text: 'Penny helped me finally understand where my money goes every month. Super easy to use!',
    avatar: '/avatars/alex.png',
  },
  {
    name: 'Sophie L.',
    role: 'Marketing Manager',
    text: 'I love that I can assign my own categories — no more guessing by the app.',
    avatar: '/avatars/sophie.png',
  },
  {
    name: 'Michael T.',
    role: 'Software Engineer',
    text: 'Seeing trends visually makes budgeting so much simpler and faster.',
    avatar: '/avatars/michael.png',
  },
];

export default function HomeTestimonialsSection() {
  const avatarColors = ['primary.main', 'secondary.main', 'info.main'];
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>
          What our users say
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((t, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: 1,
                  textAlign: 'center',
                  backgroundColor: 'grey.50',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Avatar with colored ring */}
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    mb: 2,
                    borderRadius: '50%',
                    border: 4,
                    borderColor: avatarColors[index],
                    borderStyle: 'solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Avatar
                    src={t.avatar}
                    alt={t.name}
                    sx={{ width: 64, height: 64 }}
                  />
                </Box>
                <Typography variant="body1" mb={2} fontStyle="italic">
                  {`"${t.text}"`}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.role}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
