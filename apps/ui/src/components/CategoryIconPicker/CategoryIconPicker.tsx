'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
    >
      {(Object.keys(CATEGORY_ICON_GROUPS) as CategoryIconGroup[]).map(
        (group) => (
          <Box
            key={group}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 0.5, sm: 1.5 },
            }}
          >
            <Typography
              variant="caption"
              component="div"
              noWrap
              sx={{
                width: { sm: 92 },
                flexShrink: 0,
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                textAlign: 'center',
                fontWeight: 600,
                color: 'text.secondary',
                bgcolor: 'sidebar.activeBackground',
              }}
            >
              {iconsText.GROUPS[group] ?? group}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: selected
                          ? alpha(color, 0.5)
                          : 'transparent',
                        bgcolor: selected ? alpha(color, 0.15) : undefined,
                        '&:hover': { bgcolor: alpha(color, 0.1) },
                      }}
                    >
                      <Icon fontSize="small" />
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
