'use client';

import { ReactNode } from 'react';
import {
  Box,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface SettingsListRowProps {
  leading: ReactNode;
  name: string;
  secondary: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  // when set, Delete is disabled and this explains why
  deleteDisabledReason?: string;
}

export default function SettingsListRow({
  leading,
  name,
  secondary,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  deleteDisabledReason,
}: SettingsListRowProps) {
  return (
    <ListItem
      divider
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={editLabel}>
            <IconButton aria-label={`${editLabel}: ${name}`} onClick={onEdit}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={deleteDisabledReason ?? deleteLabel}>
            {/* span keeps the tooltip working on a disabled button */}
            <span>
              <IconButton
                aria-label={`${deleteLabel}: ${name}`}
                onClick={onDelete}
                disabled={Boolean(deleteDisabledReason)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      }
      sx={{ pr: 14 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{leading}</ListItemIcon>
      <ListItemText
        primary={name}
        secondary={secondary}
        slotProps={{ primary: { noWrap: true } }}
      />
    </ListItem>
  );
}
