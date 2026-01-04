/* eslint-disable @typescript-eslint/no-explicit-any */
import { UiError } from '@/types/interfaces';
import { interpolate } from '@/utils/interpolate';

export const mapConfirmImportErrorToUiError = (
  err: any,
  dict: Record<string, any>,
): UiError => {
  const code = err?.code;
  const meta = err?.meta;
  const statusCode = err?.statusCode;

  const errors = dict.ERRORS;

  if (code) {
    switch (code) {
      case 'import.not_found':
        return {
          severity: 'error',
          title: errors.IMPORT_NOT_FOUND.TITLE,
          message: errors.IMPORT_NOT_FOUND.MESSAGE,
        };

      case 'import.already_confirmed':
        return {
          severity: 'warning',
          title: errors.IMPORT_ALREADY_CONFIRMED.TITLE,
          message: errors.IMPORT_ALREADY_CONFIRMED.MESSAGE,
        };

      case 'import.row_missing_input':
        return {
          severity: 'error',
          title: errors.IMPORT_ROW_MISSING_INPUT.TITLE,
          message: interpolate(errors.IMPORT_ROW_MISSING_INPUT.MESSAGE, {
            row: meta?.rowId,
          }),
        };

      default:
        return {
          severity: 'error',
          title: errors.UNKNOWN.TITLE,
          message: errors.UNKNOWN.MESSAGE,
        };
    }
  } else if (statusCode === 401) {
    return {
      severity: 'error',
      title: errors.UNAUTHORIZED.TITLE,
      message: errors.UNAUTHORIZED.MESSAGE,
    };
  } else {
    return {
      severity: 'error',
      title: errors.UNKNOWN.TITLE,
      message: errors.UNKNOWN.MESSAGE,
    };
  }
};
