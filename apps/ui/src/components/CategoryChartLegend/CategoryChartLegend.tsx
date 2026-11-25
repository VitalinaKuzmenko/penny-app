/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Category } from 'schemas';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';
import { formatCurrency } from '@/utils/formatCurrency';

export interface ChartCategoryItem {
  id: string;
  name: string;
  color: string;
}

// The category's icon in its colour, or a plain dot when it isn't a real category (e.g. Uncategorised)
const Marker = ({
  item,
  category,
}: {
  item: ChartCategoryItem;
  category: Category | undefined;
}) =>
  category ? (
    <CategoryIcon icon={category.icon} color={item.color} />
  ) : (
    <Box
      component="span"
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: item.color,
        flexShrink: 0,
      }}
    />
  );

interface LegendProps {
  items: ChartCategoryItem[];
  categories: Category[];
}

// Recharts legend with category icons
export function CategoryChartLegend({ items, categories }: LegendProps) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return (
    <Box
      component="ul"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1.5,
        listStyle: 'none',
        p: 0,
        m: 0,
        mt: 1,
      }}
    >
      {items.map((item) => (
        <Box
          component="li"
          key={item.id}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <Marker item={item} category={byId.get(item.id)} />
          <Typography variant="body2" component="span">
            {item.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: readonly any[];
  label?: any;
  categories: Category[];
  // which chart item a hovered entry belongs to
  itemFor: (entry: any) => ChartCategoryItem | undefined;
}

// Recharts tooltip with category icons and formatted amounts
export function CategoryChartTooltip({
  active,
  payload,
  label,
  categories,
  itemFor,
}: TooltipProps) {
  if (!active || !payload?.length) return null;
  const byId = new Map(categories.map((c) => [c.id, c]));
  return (
    <Paper sx={{ p: 1.5 }} elevation={3}>
      {label !== undefined && label !== '' && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}
      {payload.map((entry, index) => {
        const item = itemFor(entry);
        if (!item) return null;
        return (
          <Box
            key={`${item.id}-${index}`}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
          >
            <Marker item={item} category={byId.get(item.id)} />
            <Typography variant="body2" component="span">
              {item.name}: {formatCurrency(entry.value)}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
