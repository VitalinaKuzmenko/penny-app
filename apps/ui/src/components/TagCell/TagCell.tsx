/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRef, useState } from 'react';
import { Box, IconButton, Popover, Stack, Tooltip } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import TagChips from '@/components/TagChips/TagChips';
import TagPicker from '@/components/TagPicker/TagPicker';
import { TagValue } from '@/utils/tags';

interface TagCellProps {
  tags: TagValue[];
  options: TagValue[];
  onChange: (tags: TagValue[]) => void;
  disabled?: boolean;
  // EDIT plus the TagPicker texts
  text: Record<string, any>;
}

// Chips in the cell; the picker opens in a popover so rows keep their height
export default function TagCell({
  tags,
  options,
  onChange,
  disabled,
  text,
}: TagCellProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ height: '100%', minWidth: 0 }}
    >
      {!disabled && (
        // hidden while the picker is open so it can't cover it
        <Tooltip title={anchor ? '' : text.EDIT} arrow>
          <IconButton
            size="small"
            aria-label={text.EDIT}
            onClick={(e) => setAnchor(e.currentTarget)}
          >
            <LocalOfferOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <TagChips tags={tags} />

      {/* stops keys typed in the picker from reaching the grid; it sits outside
          the popover so the popover still sees Escape and closes */}
      <Box component="span" onKeyDown={(e) => e.stopPropagation()}>
        <Popover
          open={Boolean(anchor)}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            // the picker's list renders inside the popover, so it may overflow it
            paper: { sx: { overflow: 'visible' } },
            // focusing opens the list; doing it before the open animation ends
            // makes the list measure a half-scaled popover and cover the input
            transition: {
              onEntered: () =>
                pickerRef.current?.querySelector('input')?.focus(),
            },
          }}
        >
          <Box ref={pickerRef} sx={{ p: 1.5, width: 340 }}>
            <TagPicker
              options={options}
              value={tags}
              onChange={onChange}
              text={text}
              fullWidth
              inPopover
            />
          </Box>
        </Popover>
      </Box>
    </Stack>
  );
}
