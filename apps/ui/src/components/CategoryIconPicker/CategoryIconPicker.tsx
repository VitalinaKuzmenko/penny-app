'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  CATEGORY_ICON_GROUPS,
  CategoryIconGroup,
  CategoryIconName,
} from 'schemas';
import { CATEGORY_ICON_COMPONENTS } from '@/components/CategoryIcon/categoryIconComponents';

interface CategoryIconPickerProps {
  value: CategoryIconName;
  onChange: (icon: CategoryIconName) => void;
  // icons are drawn in the chosen category colour
  color: string;
  // ICON_GROUPS and ICONS from the dictionary
  iconsText: { GROUPS: Record<string, string>; NAMES: Record<string, string> };
}

// Grouped grid of the curated icons, each with a tooltip naming it
export default function CategoryIconPicker({
  value,
  onChange,
  color,
  iconsText,
}: CategoryIconPickerProps) {
  return (
    <Box
      role="radiogroup"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      {(Object.keys(CATEGORY_ICON_GROUPS) as CategoryIconGroup[]).map(
        (group) => (
          <Box key={group}>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
            >
              {iconsText.GROUPS[group] ?? group}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {CATEGORY_ICON_GROUPS[group].map((name: CategoryIconName) => {
                const Icon = CATEGORY_ICON_COMPONENTS[name];
                const selected = name === value;
                const label = iconsText.NAMES[name] ?? name;
                return (
                  <Tooltip key={name} title={label}>
                    <IconButton
                      role="radio"
                      aria-checked={selected}
                      aria-label={label}
                      onClick={() => onChange(name)}
                      sx={{
                        color,
                        border: '2px solid',
                        borderColor: selected ? color : 'transparent',
                        bgcolor: selected ? 'action.selected' : undefined,
                      }}
                    >
                      <Icon />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ),
      )}
    </Box>
  );
}
