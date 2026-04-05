/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Category } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';
import FilterMultiSelect from '@/components/FilterMultiSelect/FilterMultiSelect';
import { useMemo } from 'react';

interface Props {
  categories: Category[];
  pennysViewPageText: Record<string, any>;
}

const CategoryFilter = ({ categories, pennysViewPageText }: Props) => {
  const { filters, setFilters } = useDashboardFilters();

  const items = useMemo(
    () =>
      categories
        .filter((c) => c.name !== 'Internal Transfer')
        .map((c) => ({
          id: c.id,
          label: c.name,
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
