/* eslint-disable @typescript-eslint/no-explicit-any */
import { UiError } from '@/types/interfaces';

const fromText = (
  text: { TITLE: string; MESSAGE: string },
  severity: UiError['severity'] = 'error',
): UiError => ({ severity, title: text.TITLE, message: text.MESSAGE });

export const mapUpdateTransactionsErrorToUiError = (
  err: any,
  errorsText: Record<string, any>,
): UiError => {
  switch (err?.code) {
    case 'transactions.not_found':
      return fromText(errorsText.NOT_FOUND);
    case 'transactions.invalid_category':
      return fromText(errorsText.INVALID_CATEGORY);
    case 'transactions.deleted_not_editable':
      return fromText(errorsText.DELETED_NOT_EDITABLE);
  }

  if (err?.statusCode === 401) {
    return fromText(errorsText.UNAUTHORIZED);
  }

  return fromText(errorsText.UNKNOWN);
};
