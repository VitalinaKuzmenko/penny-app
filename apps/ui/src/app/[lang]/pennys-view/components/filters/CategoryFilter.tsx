/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Category } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';
import FilterMultiSelect from '@/components/FilterMultiSelect/FilterMultiSelect';
import { useMemo } from 'react';
import CategoryIcon from '@/components/CategoryIcon/CategoryIcon';

interface Props {
  categories: Category[];
  pennysViewPageText: Record<string, any>;
}

const CategoryFilter = ({ categories, pennysViewPageText }: Props) => {
  const { filters, setFilters } = useDashboardFilters();

  const items = useMemo(
    () =>
      categories
        .filter((c) => !c.isTransfer)
        .map((c) => ({
          id: c.id,
          label: c.name,
          icon: <CategoryIcon icon={c.icon} color={c.color} />,
        })),
    [categories],
  );

  return (
    <FilterMultiSelect
      label={pennysViewPageText.FILTERS.CATEGORY_FILTER.LABEL}
      items={items}
      value={filters.categoryIds}
      onChange={(categoryIds) => setFilters({ categoryIds })}
    />
  );
};

export default CategoryFilter;
