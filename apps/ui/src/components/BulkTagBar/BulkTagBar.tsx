/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import TagPicker from '@/components/TagPicker/TagPicker';
import {
  bulkButtonSx,
  bulkButtonsSx,
  bulkRowSx,
} from '@/components/BulkActionsPanel/BulkActionsPanel';
import { sameTagName, TagValue } from '@/utils/tags';

interface BulkTagBarProps {
  // ADD_BUTTON, REMOVE_BUTTON plus the TagPicker texts
  text: Record<string, any>;
  options: TagValue[];
  // tags on at least one selected row, the only ones worth removing
  removable: TagValue[];
  onAdd: (tags: TagValue[]) => void;
  onRemove: (tags: TagValue[]) => void;
}

// Tag control for BulkActionsPanel
export default function BulkTagBar({
  text,
  options,
  removable,
  onAdd,
  onRemove,
}: BulkTagBarProps) {
  const [chosen, setChosen] = useState<TagValue[]>([]);

  const canRemove = chosen.some((c) =>
    removable.some((r) => sameTagName(r.name, c.name)),
  );

  return (
    <Box sx={bulkRowSx}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TagPicker
          options={options}
          value={chosen}
          onChange={setChosen}
          text={text}
          fullWidth
        />
      </Box>
      <Box sx={bulkButtonsSx}>
        <CustomButton
          variantType="secondary"
          disabled={!chosen.length}
          onClick={() => {
            onAdd(chosen);
            setChosen([]);
          }}
          sx={bulkButtonSx}
        >
          {text.ADD_BUTTON}
        </CustomButton>
        <CustomButton
          variantType="secondary"
          disabled={!canRemove}
          onClick={() => {
            onRemove(chosen);
            setChosen([]);
          }}
          sx={bulkButtonSx}
        >
          {text.REMOVE_BUTTON}
        </CustomButton>
      </Box>
    </Box>
  );
}
