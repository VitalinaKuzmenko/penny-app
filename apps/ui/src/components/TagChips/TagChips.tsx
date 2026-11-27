'use client';

import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TagValue, tagKey } from '@/utils/tags';

interface TagChipsProps {
  tags: TagValue[];
  // the rest collapse into a "+N" chip so every row keeps the same height
  max?: number;
  maxChipWidth?: number;
}

export function TagDot({ color }: { color?: string | null }) {
  return (
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        bgcolor: color ?? 'grey.400',
      }}
    />
  );
}

// Light fill and border from the tag colour; falls back to grey if unparsable
const tint = (color: string | null | undefined) => {
  if (!color) return null;
  try {
    return { bg: alpha(color, 0.16), border: alpha(color, 0.45) };
  } catch {
    return null;
  }
};

// Shared look for every tag chip (cells, pickers, filters)
export const tagChipSx = (
  color: string | null | undefined,
  // unsaved tags look provisional until Save
  saved = true,
) => ({
  fontWeight: 600,
  border: '1px solid',
  bgcolor: tint(color)?.bg ?? 'grey.100',
  borderColor: tint(color)?.border ?? 'grey.300',
  borderStyle: saved ? 'solid' : 'dashed',
});

export default function TagChips({
  tags,
  max = 2,
  maxChipWidth = 120,
}: TagChipsProps) {
  if (!tags.length) return null;

  const visible = tags.slice(0, max);
  const hidden = tags.slice(max);

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ minWidth: 0, overflow: 'hidden' }}
    >
      {visible.map((tag) => (
        <Tooltip key={tagKey(tag)} title={tag.name} arrow>
          <Chip
            size="small"
            variant="outlined"
            label={tag.name}
            icon={<TagDot color={tag.color} />}
            sx={{
              maxWidth: maxChipWidth,
              pl: 0.75,
              ...tagChipSx(tag.color, Boolean(tag.id)),
            }}
          />
        </Tooltip>
      ))}
      {hidden.length > 0 && (
        <Tooltip
          title={
            <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
              {hidden.map((t) => t.name).join('\n')}
            </Box>
          }
          arrow
        >
          <Chip size="small" label={`+${hidden.length}`} />
        </Tooltip>
      )}
    </Stack>
  );
}
