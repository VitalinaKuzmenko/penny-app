/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box, List, Paper, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  Category,
  CATEGORY_ICONS,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_PALETTE,
  CategoryIconName,
  DEFAULT_CATEGORY_ICON,
  nextPaletteColour,
  UpdateCategoryInput,
} from 'schemas';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';
import { listCategories } from '@/requests/settings/listCategories';
import { createCategory } from '@/requests/settings/createCategory';
import { updateCategory } from '@/requests/settings/updateCategory';
import { deleteCategory } from '@/requests/settings/deleteCategory';
import { interpolate } from '@/utils/interpolate';
import { useSettingsList } from './useSettingsList';
import SettingsListRow from './SettingsListRow';
import SettingsItemDialog, { SettingsItemValues } from './SettingsItemDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { apiErrorDetails } from './apiError';

type Palette = (typeof CATEGORY_PALETTE)[number];

const toIconName = (icon: string | null): CategoryIconName =>
  (CATEGORY_ICONS as readonly string[]).includes(icon ?? '')
    ? (icon as CategoryIconName)
    : DEFAULT_CATEGORY_ICON;

interface CategoriesTabProps {
  // SETTINGS_PAGE
  text: Record<string, any>;
}

export default function CategoriesTab({ text }: CategoriesTabProps) {
  const t = text.CATEGORIES;
  const {
    items: categories,
    loading,
    loadFailed,
    reload,
  } = useSettingsList(listCategories);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  // by id, so the dialog shows the reloaded count if it changed meanwhile
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleting = categories.find((c) => c.id === deletingId) ?? null;

  const errorMessage = (err: unknown, name: string) => {
    const details = apiErrorDetails(err);
    if (details?.code === 'category.already_exists') {
      return interpolate(t.ALREADY_EXISTS, {
        name: details.meta?.name ?? name,
      });
    }
    if (details?.code === 'category.not_found') reload();
    return text.COMMON.GENERIC_ERROR;
  };

  const handleSubmit = async (
    values: SettingsItemValues,
  ): Promise<string | null> => {
    try {
      if (editing === 'new') {
        await createCategory({
          name: values.name,
          color: values.color as Palette,
          icon: values.icon!,
        });
      } else if (editing) {
        const changes: UpdateCategoryInput = {};
        if (values.name !== editing.name) changes.name = values.name;
        if (values.color !== editing.color) {
          changes.color = values.color as Palette;
        }
        if (values.icon !== toIconName(editing.icon))
          changes.icon = values.icon;
        if (Object.keys(changes).length) {
          await updateCategory(editing.id, changes);
        }
      }
      setEditing(null);
      reload();
      return null;
    } catch (err) {
      return errorMessage(err, values.name);
    }
  };

  const handleDelete = async (
    replacementCategoryId?: string,
  ): Promise<string | null> => {
    if (!deleting) return null;
    try {
      await deleteCategory(deleting.id, replacementCategoryId);
      setDeletingId(null);
      reload();
      return null;
    } catch (err) {
      const code = apiErrorDetails(err)?.code;
      if (
        code === 'category.replacement_required' ||
        code === 'category.invalid_replacement'
      ) {
        reload();
        return t.DELETE_DIALOG.CHANGED;
      }
      if (code === 'category.not_found') reload();
      return text.COMMON.GENERIC_ERROR;
    }
  };

  const nextColour = nextPaletteColour(
    CATEGORY_PALETTE,
    categories.map((c) => c.color),
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
            {categories.length ? (
              <List disablePadding>
                {categories.map((category) => (
                  <SettingsListRow
                    key={category.id}
                    leading={
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                        fontSize="medium"
                      />
                    }
                    name={category.name}
                    secondary={interpolate(text.COMMON.TRANSACTION_COUNT, {
                      count: category.transactionCount,
                    })}
                    editLabel={text.COMMON.EDIT}
                    deleteLabel={text.COMMON.DELETE}
                    onEdit={() => setEditing(category)}
                    onDelete={() => setDeletingId(category.id)}
                    deleteDisabledReason={
                      category.isTransfer ? t.TRANSFER_HINT : undefined
                    }
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
              ? { name: '', color: nextColour, icon: DEFAULT_CATEGORY_ICON }
              : {
                  name: editing.name,
                  color: editing.color ?? nextColour,
                  icon: toIconName(editing.icon),
                }
          }
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          namePlaceholder={t.NAME_PLACEHOLDER}
          palette={CATEGORY_PALETTE}
          withIcon
          text={text}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <DeleteCategoryDialog
          category={deleting}
          categories={categories}
          text={text}
          onClose={() => setDeletingId(null)}
          onRenameInstead={() => {
            setEditing(deleting);
            setDeletingId(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </Box>
  );
}
