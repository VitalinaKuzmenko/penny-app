/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box, List, Paper, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  nextPaletteColour,
  TAG_NAME_MAX_LENGTH,
  TAG_PALETTE,
  TagWithCount,
  UpdateTagInput,
} from 'schemas';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { listTagsWithCounts } from '@/requests/settings/listTagsWithCounts';
import { createTag } from '@/requests/settings/createTag';
import { updateTag } from '@/requests/settings/updateTag';
import { deleteTag } from '@/requests/settings/deleteTag';
import { interpolate } from '@/utils/interpolate';
import { useSettingsList } from './useSettingsList';
import SettingsListRow from './SettingsListRow';
import SettingsItemDialog, { SettingsItemValues } from './SettingsItemDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { apiErrorDetails } from './apiError';

type Palette = (typeof TAG_PALETTE)[number];

const ColourDot = ({ color }: { color: string | null }) => (
  <Box
    sx={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      bgcolor: color ?? 'grey.400',
    }}
  />
);

interface TagsTabProps {
  // SETTINGS_PAGE
  text: Record<string, any>;
}

export default function TagsTab({ text }: TagsTabProps) {
  const t = text.TAGS;
  const {
    items: tags,
    loading,
    loadFailed,
    reload,
  } = useSettingsList(listTagsWithCounts);
  const [editing, setEditing] = useState<TagWithCount | 'new' | null>(null);
  const [deleting, setDeleting] = useState<TagWithCount | null>(null);

  const handleSubmit = async (
    values: SettingsItemValues,
  ): Promise<string | null> => {
    try {
      if (editing === 'new') {
        await createTag({ name: values.name, color: values.color as Palette });
      } else if (editing) {
        const changes: UpdateTagInput = {};
        if (values.name !== editing.name) changes.name = values.name;
        if (values.color !== editing.color) {
          changes.color = values.color as Palette;
        }
        if (Object.keys(changes).length) {
          await updateTag(editing.id, changes);
        }
      }
      setEditing(null);
      reload();
      return null;
    } catch (err) {
      const details = apiErrorDetails(err);
      if (details?.code === 'tag.already_exists') {
        return interpolate(t.ALREADY_EXISTS, {
          name: details.meta?.name ?? values.name,
        });
      }
      if (details?.code === 'tag.not_found') reload();
      return text.COMMON.GENERIC_ERROR;
    }
  };

  const handleDelete = async (): Promise<string | null> => {
    if (!deleting) return null;
    try {
      await deleteTag(deleting.id);
      setDeleting(null);
      reload();
      return null;
    } catch (err) {
      if (apiErrorDetails(err)?.code === 'tag.not_found') reload();
      return text.COMMON.GENERIC_ERROR;
    }
  };

  const nextColour = nextPaletteColour(
    TAG_PALETTE,
    tags.map((tag) => tag.color),
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <CustomButton
          variantType="primary"
          startIcon={<AddIcon />}
          onClick={() => setEditing('new')}
          disabled={loading || loadFailed}
        >
          {t.ADD}
        </CustomButton>
      </Box>

      {loadFailed && (
        <ErrorBanner
          error={{
            title: text.COMMON.LOAD_ERROR.TITLE,
            message: text.COMMON.LOAD_ERROR.MESSAGE,
            severity: 'error',
          }}
        />
      )}

      {loading ? (
        <Skeleton variant="rounded" height={240} />
      ) : (
        !loadFailed && (
          <Paper variant="outlined">
            {tags.length ? (
              <List disablePadding>
                {tags.map((tag) => (
                  <SettingsListRow
                    key={tag.id}
                    leading={<ColourDot color={tag.color} />}
                    name={tag.name}
                    secondary={interpolate(text.COMMON.TRANSACTION_COUNT, {
                      count: tag.transactionCount,
                    })}
                    editLabel={text.COMMON.EDIT}
                    deleteLabel={text.COMMON.DELETE}
                    onEdit={() => setEditing(tag)}
                    onDelete={() => setDeleting(tag)}
                  />
                ))}
              </List>
            ) : (
              <Typography sx={{ p: 2 }} color="text.secondary">
                {t.EMPTY}
              </Typography>
            )}
          </Paper>
        )
      )}

      {editing && (
        <SettingsItemDialog
          title={editing === 'new' ? t.CREATE_TITLE : t.EDIT_TITLE}
          submitLabel={
            editing === 'new' ? text.COMMON.CREATE : text.COMMON.SAVE
          }
          initial={
            editing === 'new'
              ? { name: '', color: nextColour }
              : { name: editing.name, color: editing.color ?? nextColour }
          }
          maxLength={TAG_NAME_MAX_LENGTH}
          namePlaceholder={t.NAME_PLACEHOLDER}
          palette={TAG_PALETTE}
          text={text}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          title={interpolate(t.DELETE_DIALOG.TITLE, { name: deleting.name })}
          message={
            deleting.transactionCount
              ? interpolate(t.DELETE_DIALOG.MESSAGE_WITH_TRANSACTIONS, {
                  count: deleting.transactionCount,
                })
              : t.DELETE_DIALOG.MESSAGE_EMPTY
          }
          confirmLabel={text.COMMON.DELETE}
          cancelLabel={text.COMMON.CANCEL}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </Box>
  );
}
