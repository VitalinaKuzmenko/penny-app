/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
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

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ height: '100%', minWidth: 0 }}
    >
      {!disabled && (
        <Tooltip title={text.EDIT} arrow>
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

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {/* the grid would otherwise react to keys typed in the picker */}
        <Box sx={{ p: 1.5, width: 340 }} onKeyDown={(e) => e.stopPropagation()}>
          <TagPicker
            options={options}
            value={tags}
            onChange={onChange}
            text={text}
            autoFocus
            fullWidth
          />
        </Box>
      </Popover>
    </Stack>
  );
}
