/* eslint-disable @typescript-eslint/no-explicit-any */
import { UiError } from '@/types/interfaces';
import { interpolate } from '@/utils/interpolate';

export const mapConfirmImportErrorToUiError = (
  err: any,
  errorsText: Record<string, any>,
): UiError => {
  const code = err?.code;
  const meta = err?.meta;
  const statusCode = err?.statusCode;

  if (code) {
    switch (code) {
      case 'import.not_found':
        return {
          severity: 'error',
          title: errorsText.IMPORT_NOT_FOUND.TITLE,
          message: errorsText.IMPORT_NOT_FOUND.MESSAGE,
        };

      case 'import.already_confirmed':
        return {
          severity: 'warning',
          title: errorsText.IMPORT_ALREADY_CONFIRMED.TITLE,
          message: errorsText.IMPORT_ALREADY_CONFIRMED.MESSAGE,
        };

      case 'import.row_missing_input':
        return {
          severity: 'error',
          title: errorsText.IMPORT_ROW_MISSING_INPUT.TITLE,
          message: interpolate(errorsText.IMPORT_ROW_MISSING_INPUT.MESSAGE, {
            row: meta?.rowId,
          }),
        };

      default:
        return {
          severity: 'error',
          title: errorsText.UNKNOWN.TITLE,
          message: errorsText.UNKNOWN.MESSAGE,
        };
    }
  } else if (statusCode === 401) {
    return {
      severity: 'error',
      title: errorsText.UNAUTHORIZED.TITLE,
      message: errorsText.UNAUTHORIZED.MESSAGE,
    };
  } else {
    return {
      severity: 'error',
      title: errorsText.UNKNOWN.TITLE,
      message: errorsText.UNKNOWN.MESSAGE,
    };
  }
};
