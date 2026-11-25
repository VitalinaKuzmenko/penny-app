import { Category } from 'schemas';

// When every category is selected, send no category filter so expenses
// without a category still show up (as "Uncategorised")
export const chartCategoryIds = (
  selectedIds: string[],
  categories: Category[],
): string[] | undefined => {
  const selectable = categories.filter((c) => !c.isTransfer);
  const allSelected = selectable.every((c) => selectedIds.includes(c.id));
  return allSelected ? undefined : selectedIds;
};
