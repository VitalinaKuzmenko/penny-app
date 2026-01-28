// context/FilterContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Dayjs } from 'dayjs';

export type TransactionTypeFilter = 'BOTH' | 'INCOME' | 'EXPENSE';

export interface DashboardFilters {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  categoryIds: string[];
  accountIds: string[];
  type: TransactionTypeFilter;
}

interface FilterContextProps {
  filters: DashboardFilters;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: DashboardFilters = {
  startDate: null,
  endDate: null,
  categoryIds: [],
  accountIds: [],
  type: 'BOTH',
};

const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<DashboardFilters>(defaultFilters);

  const setFilters = (newFilters: Partial<DashboardFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
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
