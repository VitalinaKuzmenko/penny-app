'use client';

import { ReactNode } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface SettingsListRowProps {
  leading: ReactNode;
  // item colour used to tint the icon tile; lavender when not set
  tint?: string | null;
  name: string;
  secondary: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  // when set, Delete is disabled and this explains why
  deleteDisabledReason?: string;
}

const actionSx = { width: 40, height: 40 };

export default function SettingsListRow({
  leading,
  tint,
  name,
  secondary,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  deleteDisabledReason,
}: SettingsListRowProps) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 1.25, sm: 1.5 },
        pr: { xs: 1.25, sm: 2 },
        borderRadius: '18px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 10px rgba(83, 36, 70, 0.05)',
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: '0 6px 18px rgba(83, 36, 70, 0.1)' },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: tint ? alpha(tint, 0.14) : 'sidebar.activeBackground',
        }}
      >
        {leading}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          noWrap
          sx={(theme) => ({
            fontFamily: theme.typography.h6.fontFamily,
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'text.primary',
          })}
        >
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {secondary}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Tooltip title={editLabel}>
          <IconButton
            aria-label={`${editLabel}: ${name}`}
            onClick={onEdit}
            sx={{
              ...actionSx,
              color: 'secondary.main',
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'sidebar.activeBackground' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={deleteDisabledReason ?? deleteLabel}>
          {/* span keeps the tooltip working on a disabled button */}
          <span>
            <IconButton
              aria-label={`${deleteLabel}: ${name}`}
              onClick={onDelete}
              disabled={Boolean(deleteDisabledReason)}
              sx={(theme) => ({
                ...actionSx,
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.08),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                '&.Mui-disabled': { bgcolor: 'grey.50', color: 'grey.400' },
              })}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
