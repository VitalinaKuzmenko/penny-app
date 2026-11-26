'use client';

import { useState } from 'react';
import {
  Box,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { interpolate } from '@/utils/interpolate';
import { YearPreset } from '@/utils/yearPresets';

export interface YearPresetsText {
  OLDER: string;
  ALL_TIME?: string;
  // e.g. "1 Jan – 31 Dec {year}"
  TOOLTIP: string;
}

interface YearPresetsProps {
  // newest first
  years: number[];
  selected: YearPreset | null;
  onSelectYear: (year: number) => void;
  // shows the "All time" chip when given
  onSelectAllTime?: () => void;
  text: YearPresetsText;
  disabled?: boolean;
}

export default function YearPresets({
  years,
  selected,
  onSelectYear,
  onSelectAllTime,
  text,
  disabled = false,
}: YearPresetsProps) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [olderAnchor, setOlderAnchor] = useState<HTMLElement | null>(null);

  const visibleYears = years.slice(0, isPhone ? 2 : 4);
  const olderYears = years.slice(visibleYears.length);
  const selectedOlderYear =
    typeof selected === 'number' && olderYears.includes(selected)
      ? selected
      : null;

  const chipProps = (isSelected: boolean) =>
    ({
      color: isSelected ? 'primary' : 'default',
      variant: isSelected ? 'filled' : 'outlined',
      clickable: true,
      disabled,
      'aria-pressed': isSelected,
    }) as const;

  // clicking the selected chip does nothing
  const selectYear = (year: number) => {
    if (year !== selected) onSelectYear(year);
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {visibleYears.map((year) => (
        <Tooltip key={year} title={interpolate(text.TOOLTIP, { year })}>
          <Chip
            label={year}
            onClick={() => selectYear(year)}
            {...chipProps(year === selected)}
          />
        </Tooltip>
      ))}

      {olderYears.length > 0 && (
        <>
          <Chip
            label={
              <Box component="span" display="inline-flex" alignItems="center">
                {selectedOlderYear ?? text.OLDER}
                <ArrowDropDownIcon fontSize="small" sx={{ mr: -0.75 }} />
              </Box>
            }
            onClick={(e) => setOlderAnchor(e.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={olderAnchor !== null}
            {...chipProps(selectedOlderYear !== null)}
          />
          <Menu
            anchorEl={olderAnchor}
            open={olderAnchor !== null}
            onClose={() => setOlderAnchor(null)}
          >
            {olderYears.map((year) => (
              <MenuItem
                key={year}
                selected={year === selected}
                title={interpolate(text.TOOLTIP, { year })}
                onClick={() => {
                  setOlderAnchor(null);
                  selectYear(year);
                }}
              >
                {year}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {onSelectAllTime && text.ALL_TIME && (
        <Chip
          label={text.ALL_TIME}
          onClick={() => {
            if (selected !== 'ALL') onSelectAllTime();
          }}
          {...chipProps(selected === 'ALL')}
        />
      )}
    </Box>
  );
}
