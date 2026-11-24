import { Category } from 'schemas';
import { TRANSFER_CATEGORY_NAME } from '@/utils/transactionType';

// When every category is selected, send no category filter so expenses
// without a category still show up (as "Uncategorised")
export const chartCategoryIds = (
  selectedIds: string[],
  categories: Category[],
): string[] | undefined => {
  const selectable = categories.filter(
    (c) => c.name !== TRANSFER_CATEGORY_NAME,
  );
  const allSelected = selectable.every((c) => selectedIds.includes(c.id));
  return allSelected ? undefined : selectedIds;
};
