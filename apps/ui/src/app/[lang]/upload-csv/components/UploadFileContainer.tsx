'use client';

import { Paper, Typography, Button, Stack, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useRef } from 'react';

interface UploadFileContainerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileContainerText: Record<string, any>;
  selectedFile: File | null;
  onFileUpload: (file: File) => void;
}

const UploadFileContainer = ({
  fileContainerText,
  selectedFile,
  onFileUpload,
}: UploadFileContainerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileUpload(file);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        my: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: '2px dashed',
        borderColor: 'grey.300',
        textAlign: 'center',
        transition: 'border-color 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'grey.50',
        },
      }}
    >
      <Stack spacing={2} alignItems="center">
        <UploadFileIcon color="primary" sx={{ fontSize: 40 }} />

        <Typography fontWeight={600}>{fileContainerText.DRAG_DROP}</Typography>

        <Typography variant="body2" color="text.secondary">
          {fileContainerText.OR}
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleChooseFile}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          {fileContainerText.CHOOSE_FILE}
        </Button>

        {selectedFile && (
          <Box
            sx={{
              mt: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: 'grey.100',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <UploadFileIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={500}>
              {selectedFile.name}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {fileContainerText.INFO}
        </Typography>
      </Stack>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={handleFileChange}
      />
    </Paper>
  );
};

export default UploadFileContainer;
