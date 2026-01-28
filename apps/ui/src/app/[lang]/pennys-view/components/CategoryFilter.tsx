'use client';

import { Category } from 'schemas';
import { useDashboardFilters } from '@/providers/FilterContext';
import FilterMultiSelect from '@/components/FilterMultiSelect/FilterMultiSelect';
import { useMemo } from 'react';

interface Props {
  categories: Category[];
}

const CategoryFilter = ({ categories }: Props) => {
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
      label="Categories"
      items={items}
      value={filters.categoryIds}
      onChange={(categoryIds) => setFilters({ categoryIds })}
    />
  );
};

export default CategoryFilter;
