import { UiError } from '@/types/interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapUploadCsvErrorToUiError = (err: any): UiError => {
  switch (err?.code) {
    case 'import.file_required':
      return {
        severity: 'warning',
        title: 'File required',
        message: 'Please upload a CSV file before importing.',
      };

    case 'import.file_not_csv':
      return {
        severity: 'error',
        title: 'Invalid file format',
        message: 'Only CSV files are supported.',
      };

    case 'auth.unauthorized':
      return {
        severity: 'error',
        title: 'Session expired',
        message: 'Please sign in again to continue.',
      };

    default:
      return {
        severity: 'error',
        title: 'Upload failed',
        message: 'Something went wrong while uploading the file.',
      };
  }
};
