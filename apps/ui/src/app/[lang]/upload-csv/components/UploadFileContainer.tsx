'use client';

import { Typography, Button, Stack, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import Image from 'next/image';
import uploadIllustration from '../../../../../public/Upload_image.png';
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
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: '20px',
        border: '2px dashed',
        borderColor: 'secondary.light',
        bgcolor: '#FBF2FE',
        textAlign: 'center',
        transition: 'border-color 0.2s ease',
        '&:hover': { borderColor: 'secondary.main' },
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <Image
          src={uploadIllustration}
          alt=""
          aria-hidden
          width={170}
          height={108}
          style={{ height: 'auto' }}
        />

        <Typography
          variant="h5"
          component="p"
          sx={{ color: 'secondary.main', fontWeight: 700 }}
        >
          {fileContainerText.DRAG_DROP}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {fileContainerText.OR}
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleChooseFile}
          startIcon={<InsertDriveFileOutlined />}
          sx={{ px: 4, py: 1.25, borderRadius: '12px' }}
        >
          {fileContainerText.CHOOSE_FILE}
        </Button>

        {selectedFile && (
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: '12px',
              bgcolor: 'background.paper',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              maxWidth: '100%',
            }}
          >
            <UploadFileIcon fontSize="small" color="secondary" />
            <Typography variant="body2" fontWeight={600} noWrap>
              {selectedFile.name}
            </Typography>
          </Box>
        )}
      </Stack>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default UploadFileContainer;
