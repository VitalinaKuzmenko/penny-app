/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import {
  nextPaletteColour,
  TAG_NAME_MAX_LENGTH,
  TAG_PALETTE,
  TagWithCount,
  UpdateTagInput,
} from 'schemas';
import { listTagsWithCounts } from '@/requests/settings/listTagsWithCounts';
import { createTag } from '@/requests/settings/createTag';
import { updateTag } from '@/requests/settings/updateTag';
import { deleteTag } from '@/requests/settings/deleteTag';
import { interpolate } from '@/utils/interpolate';
import { useSettingsList } from './useSettingsList';
import SettingsListRow from './SettingsListRow';
import SettingsListPanel from './SettingsListPanel';
import SettingsItemDialog, { SettingsItemValues } from './SettingsItemDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { apiErrorDetails } from './apiError';

type Palette = (typeof TAG_PALETTE)[number];

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
      <SettingsListPanel
        icon={<LocalOfferOutlinedIcon />}
        info={t.INFO}
        count={tags.length}
        addLabel={t.ADD}
        onAdd={() => setEditing('new')}
        emptyText={t.EMPTY}
        loading={loading}
        loadFailed={loadFailed}
        text={text}
      >
        {tags.map((tag) => (
          <SettingsListRow
            key={tag.id}
            leading={
              <LocalOfferOutlinedIcon
                sx={{ color: tag.color ?? 'text.secondary' }}
              />
            }
            tint={tag.color}
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
      </SettingsListPanel>

      {editing && (
        <SettingsItemDialog
          title={editing === 'new' ? t.CREATE_TITLE : t.EDIT_TITLE}
          subtitle={t.DIALOG_SUBTITLE}
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
