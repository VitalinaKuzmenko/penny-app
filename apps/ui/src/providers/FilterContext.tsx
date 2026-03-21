// context/FilterContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Dayjs } from 'dayjs';

export type TransactionTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export interface DashboardFilters {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  categoryIds: string[];
  accountIds: string[];
  type: TransactionTypeFilter;
}

interface FilterContextProps {
  filters: DashboardFilters; // draft
  appliedFilters: DashboardFilters; // used by charts
  setFilters: (filters: Partial<DashboardFilters>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const defaultFilters: DashboardFilters = {
  startDate: null,
  endDate: null,
  categoryIds: [],
  accountIds: [],
  type: 'ALL',
};

const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<DashboardFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<DashboardFilters>(defaultFilters);

  const setFilters = (newFilters: Partial<DashboardFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };
  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        appliedFilters,
        setFilters,
        applyFilters,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useDashboardFilters must be used within a FilterProvider');
  }
  return context;
};
