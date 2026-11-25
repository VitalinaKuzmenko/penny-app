'use client';

import { Box } from '@mui/material';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';

interface CategoryLabelProps {
  category: { name: string; icon: string | null; color: string | null };
}

// Icon + name, for dropdowns, filters and lists
export default function CategoryLabel({ category }: CategoryLabelProps) {
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, minWidth: 0 }}
    >
      <CategoryIcon icon={category.icon} color={category.color} />
      <Box
        component="span"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {category.name}
      </Box>
    </Box>
  );
}
