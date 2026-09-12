/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import CustomButton from '@/components/ui/CustomButton/CustomButton';
import { Alert, Stack } from '@mui/material';

interface DuplicatesBarProps {
  pageText: Record<string, any>;
  duplicateCount: number;
  onSkipAll: () => void;
  onImportAll: () => void;
}

export default function DuplicatesBar({
  pageText,
  duplicateCount,
  onSkipAll,
  onImportAll,
}: DuplicatesBarProps) {
  if (!duplicateCount) return null;

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2, alignItems: 'center' }}
      action={
        <Stack direction="row" spacing={1}>
          <CustomButton variantType="text" size="small" onClick={onSkipAll}>
            {pageText.SKIP_ALL}
          </CustomButton>
          <CustomButton variantType="text" size="small" onClick={onImportAll}>
            {pageText.IMPORT_ALL}
          </CustomButton>
        </Stack>
      }
    >
      {String(pageText.SUMMARY).replace('{count}', String(duplicateCount))}
    </Alert>
  );
}
