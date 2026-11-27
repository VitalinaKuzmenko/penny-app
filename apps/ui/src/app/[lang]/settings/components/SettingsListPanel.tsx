/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ReactNode } from 'react';
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CustomButton from '@/components/ui/CustomButton/CustomButton';
import ErrorBanner from '@/components/ErrorBanner/ErrorBanner';
import { interpolate } from '@/utils/interpolate';

interface SettingsListPanelProps {
  icon: ReactNode;
  info: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
  emptyText: string;
  loading: boolean;
  loadFailed: boolean;
  // SETTINGS_PAGE
  text: Record<string, any>;
  // SettingsListRow items
  children: ReactNode;
}

// Shared frame of each Settings tab: note, toolbar and the list of rows
export default function SettingsListPanel({
  icon,
  info,
  count,
  addLabel,
  onAdd,
  emptyText,
  loading,
  loadFailed,
  text,
  children,
}: SettingsListPanelProps) {
  return (
    <Stack spacing={2.5}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          px: 2.5,
          py: 1.5,
          borderRadius: '16px',
          bgcolor: 'sidebar.activeBackground',
          color: 'secondary.main',
        }}
      >
        <InfoOutlinedIcon />
        <Typography variant="body2" color="text.primary">
          {info}
        </Typography>
      </Stack>

      <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '24px' }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          {!loading && !loadFailed ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 999,
                bgcolor: 'sidebar.activeBackground',
                color: 'secondary.main',
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
              <Typography variant="body2" fontWeight={700}>
                {interpolate(text.COMMON.TOTAL, { count })}
              </Typography>
            </Stack>
          ) : (
            <Box />
          )}
          <CustomButton
            variantType="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={loading || loadFailed}
            sx={{ borderRadius: '14px', px: 2.5, py: 1 }}
          >
            {addLabel}
          </CustomButton>
        </Stack>

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
          <Stack spacing={1.25}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={74}
                sx={{ borderRadius: '18px' }}
              />
            ))}
          </Stack>
        ) : (
          !loadFailed &&
          (count ? (
            <Stack
              component="ul"
              spacing={1.25}
              sx={{ listStyle: 'none', m: 0, p: 0 }}
            >
              {children}
            </Stack>
          ) : (
            <Typography
              color="text.secondary"
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: '18px',
                bgcolor: 'grey.50',
              }}
            >
              {emptyText}
            </Typography>
          ))
        )}
      </Paper>
    </Stack>
  );
}
