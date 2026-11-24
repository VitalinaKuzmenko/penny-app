import { Category, TransactionListItem } from 'schemas';
import { resolveMoneyInType } from '@/utils/transactionType';
import { sameTagSet, TagValue } from '@/utils/tags';

// An unsaved edit to one row; only fields the user actually changed are set
export interface PendingChange {
  description?: string;
  // null = clear the category
  categoryId?: string | null;
  // the row's full set of tags after the edit
  tags?: TagValue[];
  // true = delete, false = restore
  deleted?: boolean;
}

export type PendingChanges = Record<string, PendingChange>;

export const effectiveRow = (
  row: TransactionListItem,
  change: PendingChange | undefined,
  categories: Category[],
) => {
  const description = change?.description ?? row.description ?? '';
  const categoryId =
    change?.categoryId !== undefined
      ? change.categoryId
      : (row.category?.id ?? null);
  // money out never changes type; money in follows the refund rule
  const type: TransactionListItem['type'] =
    row.type === 'EXPENSE'
      ? 'EXPENSE'
      : resolveMoneyInType(categoryId, categories);
  const pendingDelete = change?.deleted === true;
  const pendingRestore = change?.deleted === false;

  return {
    description,
    categoryId,
    type,
    tags: change?.tags ?? (row.tags as TagValue[]),
    pendingDelete,
    pendingRestore,
    // deleted rows must be restored first; rows about to be deleted aren't worth editing
    locked: (row.deleted && !pendingRestore) || pendingDelete,
    descriptionInvalid: description.trim().length === 0,
  };
};

// Drops fields that match the saved row so "changed back" isn't an unsaved change
export const normaliseChange = (
  row: TransactionListItem,
  change: PendingChange,
): PendingChange | null => {
  const next: PendingChange = {};

  // exact comparison so a trailing space mid-typing isn't dropped; trimmed on save
  if (
    change.description !== undefined &&
    change.description !== (row.description ?? '')
  ) {
    next.description = change.description;
  }
  if (
    change.categoryId !== undefined &&
    change.categoryId !== (row.category?.id ?? null)
  ) {
    next.categoryId = change.categoryId;
  }
  if (change.deleted !== undefined && change.deleted !== row.deleted) {
    next.deleted = change.deleted;
  }
  if (change.tags !== undefined && !sameTagSet(change.tags, row.tags)) {
    next.tags = change.tags;
  }

  // A row that stays deleted is locked and the server rejects edits on it,
  // so undoing a restore also drops edits made while it was restored
  if (row.deleted && next.deleted !== false) {
    delete next.description;
    delete next.categoryId;
    delete next.tags;
  }

  return Object.keys(next).length ? next : null;
};
