/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Autocomplete,
  Box,
  Chip,
  createFilterOptions,
  Stack,
  TextField,
} from '@mui/material';
import { TAG_NAME_MAX_LENGTH } from 'schemas';
import { interpolate } from '@/utils/interpolate';
import { sameTagName, TagValue, tagKey } from '@/utils/tags';
import { TagDot, tagChipSx } from '@/components/TagChips/TagChips';

type TagOption = TagValue & { create?: boolean };

const toTag = ({ id, name, color }: TagOption): TagValue => ({
  id,
  name,
  color,
});

const filter = createFilterOptions<TagOption>({ stringify: (o) => o.name });

interface TagPickerProps {
  options: TagValue[];
  value: TagValue[];
  onChange: (value: TagValue[]) => void;
  // PLACEHOLDER, CREATE ("Create tag "{name}""), NO_OPTIONS
  text: Record<string, any>;
  autoFocus?: boolean;
  fullWidth?: boolean;
  // keep the list inside the popover; a portalled list is positioned while
  // the popover is still animating open and ends up covering the input
  inPopover?: boolean;
}

export default function TagPicker({
  options,
  value,
  onChange,
  text,
  autoFocus,
  fullWidth,
  inPopover,
}: TagPickerProps) {
  return (
    <Autocomplete<TagOption, true, false, false>
      multiple
      size="small"
      autoHighlight
      // with no tags yet there's nothing to pick until the user types a name
      openOnFocus={options.length > 0}
      disablePortal={inPopover}
      filterSelectedOptions
      fullWidth={fullWidth}
      options={options}
      value={value}
      onChange={(_, next) => onChange(next.map(toTag))}
      isOptionEqualToValue={(a, b) => tagKey(a) === tagKey(b)}
      getOptionLabel={(o) => o.name}
      getOptionKey={(o) => (o.create ? `create:${o.name}` : tagKey(o))}
      filterOptions={(opts, state) => {
        const filtered = filter(opts, state);
        const input = state.inputValue.trim();
        // names are unique ignoring case, so an existing match is picked instead of creating
        const exists = [...options, ...value].some((o) =>
          sameTagName(o.name, input),
        );
        if (input && !exists) {
          filtered.push({ name: input, create: true });
        }
        return filtered;
      }}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          {option.create ? (
            interpolate(text.CREATE, { name: option.name })
          ) : (
            <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
              <TagDot color={option.color} />
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {option.name}
              </Box>
            </Stack>
          )}
        </li>
      )}
      renderValue={(selected, getItemProps) =>
        selected.map((tag, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          return (
            <Chip
              key={key}
              {...itemProps}
              size="small"
              label={tag.name}
              icon={<TagDot color={tag.color} />}
              sx={{
                maxWidth: 160,
                pl: 0.75,
                ...tagChipSx(tag.color, Boolean(tag.id)),
              }}
            />
          );
        })
      }
      noOptionsText={text.NO_OPTIONS}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          placeholder={value.length ? undefined : text.PLACEHOLDER}
          inputProps={{ ...params.inputProps, maxLength: TAG_NAME_MAX_LENGTH }}
        />
      )}
    />
  );
}
