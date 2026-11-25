'use client';

import { Box, ButtonBase, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface ColourSwatchPickerProps {
  palette: readonly string[];
  value: string;
  onChange: (colour: string) => void;
  // accessible name of the group, e.g. "Colour"
  label: string;
}

export default function ColourSwatchPicker({
  palette,
  value,
  onChange,
  label,
}: ColourSwatchPickerProps) {
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
    >
      {palette.map((colour) => {
        const selected = colour.toUpperCase() === value.toUpperCase();
        return (
          <Tooltip key={colour} title={colour}>
            <ButtonBase
              role="radio"
              aria-checked={selected}
              aria-label={colour}
              onClick={() => onChange(colour)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: colour,
                color: 'common.white',
                outline: selected ? '2px solid' : 'none',
                outlineColor: 'text.primary',
                outlineOffset: 2,
              }}
            >
              {selected && <CheckIcon fontSize="small" />}
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );
}
