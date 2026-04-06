'use client';

import { Box, Container, Grid, Typography, Avatar } from '@mui/material';

export default function HomeTestimonialsSection({
  homePageText,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homePageText: Record<string, any>;
}) {
  const testimonials = [
    {
      name: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[0].NAME,
      role: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[0].ROLE,
      text: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[0].TEXT,
      avatar: '/avatars/alex.jpeg',
    },
    {
      name: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[1].NAME,
      role: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[1].ROLE,
      text: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[1].TEXT,
      avatar: '/avatars/sophie.jpeg',
    },
    {
      name: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[2].NAME,
      role: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[2].ROLE,
      text: homePageText.TESTIMONIALS_SECTION.TESTIMONIALS[2].TEXT,
      avatar: '/avatars/michael.jpeg',
    },
  ];

  const avatarColors = ['primary.main', 'secondary.main', 'info.main'];
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={6}>
          {homePageText.TESTIMONIALS_SECTION.TITLE}
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
