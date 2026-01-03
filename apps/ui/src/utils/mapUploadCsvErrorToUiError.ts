/* eslint-disable @typescript-eslint/no-explicit-any */

import { UiError } from '@/types/interfaces';
import { interpolate } from '@/utils/interpolate';

export const mapUploadCsvErrorToUiError = (
  err: any,
  dict: Record<string, any>,
): UiError => {
  const code = err?.code;
  const meta = err?.meta;

  const errors = dict.ERRORS;

  switch (code) {
    case 'import.file_required':
      return {
        severity: 'warning',
        title: errors.FILE_REQUIRED.TITLE,
        message: errors.FILE_REQUIRED.MESSAGE,
      };

    case 'import.file_not_csv':
      return {
        severity: 'error',
        title: errors.FILE_NOT_CSV.TITLE,
        message: errors.FILE_NOT_CSV.MESSAGE,
      };

    case 'import.csv_invalid':
      return {
        severity: 'error',
        title: errors.CSV_INVALID.TITLE,
        message: errors.CSV_INVALID.MESSAGE,
      };

    case 'import.csv_empty':
      return {
        severity: 'warning',
        title: errors.CSV_EMPTY.TITLE,
        message: errors.CSV_EMPTY.MESSAGE,
      };

    case 'import.csv_missing_column':
      return {
        severity: 'error',
        title: errors.CSV_MISSING_COLUMN.TITLE,
        message: interpolate(errors.CSV_MISSING_COLUMN.MESSAGE, {
          column: meta?.column,
        }),
      };

    case 'import.invalid_date':
      return {
        severity: 'error',
        title: errors.INVALID_DATE.TITLE,
        message: interpolate(errors.INVALID_DATE.MESSAGE, { row: meta?.row }),
      };

    case 'import.invalid_amount':
      return {
        severity: 'error',
        title: errors.INVALID_AMOUNT.TITLE,
        message: interpolate(errors.INVALID_AMOUNT.MESSAGE, { row: meta?.row }),
      };

    case 'import.row_validation_failed':
      return {
        severity: 'error',
        title: errors.ROW_VALIDATION_FAILED.TITLE,
        message: interpolate(errors.ROW_VALIDATION_FAILED.MESSAGE, {
          row: meta?.row,
        }),
      };

    case 'auth.unauthorized':
      return {
        severity: 'error',
        title: errors.UNAUTHORIZED.TITLE,
        message: errors.UNAUTHORIZED.MESSAGE,
      };

    default:
      return {
        severity: 'error',
        title: errors.UNKNOWN.TITLE,
        message: errors.UNKNOWN.MESSAGE,
      };
  }
};
