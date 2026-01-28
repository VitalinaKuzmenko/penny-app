'use client';

import { Typography, Box } from '@mui/material';
import DashboardFilters from './DashboardFilters';

const MainDashboard = () => {
  return (
    <div>
      {/* Hero */}
      <Box sx={{ p: { xs: 3, md: 3 } }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Penny&apos;s View
        </Typography>
      </Box>

      <DashboardFilters />
    </div>
  );
};

export default MainDashboard;
