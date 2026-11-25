/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Box, List, Paper, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { ACCOUNT_NAME_MAX_LENGTH, AccountWithActivity } from 'schemas';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { listAccounts } from '@/requests/settings/listAccounts';
import { renameAccount } from '@/requests/settings/renameAccount';
import { deleteAccount } from '@/requests/settings/deleteAccount';
import { createAccount } from '@/requests/createAccount';
import { interpolate } from '@/utils/interpolate';
import { useSettingsList } from './useSettingsList';
import SettingsListRow from './SettingsListRow';
import SettingsItemDialog, { SettingsItemValues } from './SettingsItemDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { apiErrorDetails } from './apiError';

interface AccountsTabProps {
  // SETTINGS_PAGE
  text: Record<string, any>;
}

export default function AccountsTab({ text }: AccountsTabProps) {
  const t = text.ACCOUNTS;
  const {
    items: accounts,
    loading,
    loadFailed,
    reload,
  } = useSettingsList(listAccounts);
  const [editing, setEditing] = useState<AccountWithActivity | 'new' | null>(
    null,
  );
  const [deleting, setDeleting] = useState<AccountWithActivity | null>(null);

  const handleSubmit = async (
    values: SettingsItemValues,
  ): Promise<string | null> => {
    try {
      if (editing === 'new') {
        await createAccount({ name: values.name });
      } else if (editing && values.name !== editing.name) {
        await renameAccount(editing.id, { name: values.name });
      }
      setEditing(null);
      reload();
      return null;
    } catch (err) {
      const details = apiErrorDetails(err);
      if (details?.code === 'account.already_exists') {
        return interpolate(t.ALREADY_EXISTS, {
          name: details.meta?.name ?? values.name,
        });
      }
      if (details?.code === 'account.not_found') reload();
      return text.COMMON.GENERIC_ERROR;
    }
  };

  const handleDelete = async (): Promise<string | null> => {
    if (!deleting) return null;
    try {
      await deleteAccount(deleting.id);
      setDeleting(null);
      reload();
      return null;
    } catch (err) {
      const code = apiErrorDetails(err)?.code;
      if (code === 'account.has_transactions') {
        reload();
        return t.CANT_DELETE;
      }
      if (code === 'account.not_found') reload();
      return text.COMMON.GENERIC_ERROR;
    }
  };

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
        <Skeleton variant="rounded" height={160} />
      ) : (
        !loadFailed && (
          <Paper variant="outlined">
            {accounts.length ? (
              <List disablePadding>
                {accounts.map((account) => (
                  <SettingsListRow
                    key={account.id}
                    leading={
                      <AccountBalanceWalletOutlinedIcon color="action" />
                    }
                    name={account.name}
                    secondary={interpolate(text.COMMON.TRANSACTION_COUNT, {
                      count: account.transactionCount,
                    })}
                    editLabel={text.COMMON.EDIT}
                    deleteLabel={text.COMMON.DELETE}
                    onEdit={() => setEditing(account)}
                    onDelete={() => setDeleting(account)}
                    deleteDisabledReason={
                      account.transactionCount > 0 ? t.CANT_DELETE : undefined
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
          initial={{ name: editing === 'new' ? '' : editing.name }}
          maxLength={ACCOUNT_NAME_MAX_LENGTH}
          namePlaceholder={t.NAME_PLACEHOLDER}
          text={text}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          title={interpolate(t.DELETE_DIALOG.TITLE, { name: deleting.name })}
          message={t.DELETE_DIALOG.MESSAGE}
          confirmLabel={text.COMMON.DELETE}
          cancelLabel={text.COMMON.CANCEL}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </Box>
  );
}
