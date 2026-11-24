/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box, Stack } from '@mui/material';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import TagPicker from '@/components/TagPicker/TagPicker';
import { sameTagName, TagValue } from '@/utils/tags';

interface BulkTagBarProps {
  // LABEL, ADD_BUTTON, REMOVE_BUTTON plus the TagPicker texts
  text: Record<string, any>;
  options: TagValue[];
  selectedCount: number;
  // tags on at least one selected row, the only ones worth removing
  removable: TagValue[];
  onAdd: (tags: TagValue[]) => void;
  onRemove: (tags: TagValue[]) => void;
}

export default function BulkTagBar({
  text,
  options,
  selectedCount,
  removable,
  onAdd,
  onRemove,
}: BulkTagBarProps) {
  const [chosen, setChosen] = useState<TagValue[]>([]);

  if (!selectedCount) return null;

  const canRemove = chosen.some((c) =>
    removable.some((r) => sameTagName(r.name, c.name)),
  );

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      mb={2}
      alignItems="center"
    >
      <Box sx={{ flex: 1 }} />
      <Box sx={{ flex: 2, width: '100%' }}>
        <TagPicker
          options={options}
          value={chosen}
          onChange={setChosen}
          text={text}
          fullWidth
        />
      </Box>
      <CustomButton
        variantType="secondary"
        disabled={!chosen.length}
        onClick={() => {
          onAdd(chosen);
          setChosen([]);
        }}
        sx={{ minWidth: 180 }}
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
        sx={{ minWidth: 180 }}
      >
        {text.REMOVE_BUTTON}
      </CustomButton>
    </Stack>
  );
}
